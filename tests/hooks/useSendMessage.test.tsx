import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse, delay } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import { useMessages, messagesQueryKey } from "@/lib/hooks/useMessages";
import { conversationsQueryKey } from "@/lib/hooks/useConversations";
import { server } from "../msw/server";
import type { LocalMessage, Message } from "@/lib/api";

// O cliente axios resolve baseURL no momento da importação, lendo
// process.env.NEXT_PUBLIC_API_URL. Em ambiente de teste essa env não existe, então
// cai no fallback "http://localhost:4000" — é esse host que precisamos mockar.
const API_BASE = "http://localhost:4000";
const CONVERSATION_ID = "conv-1";

function makeWrapper(initialMessages: LocalMessage[] = []) {
  // QueryClient próprio por teste evita vazamento de cache entre specs.
  // retry:false impede o react-query reexecutar a mutation em erro e
  // bagunçar os asserts. gcTime:Infinity mantém o cache pra inspeção pós-render.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false },
    },
  });

  // Sementeia o cache de mensagens como se o useMessages já tivesse rodado.
  // Sem isso, o optimistic update do hook teria que assumir cache vazio — o
  // que ainda funciona, mas testar com histórico prévio cobre o caso real
  // (usuário envia depois de ler a conversa).
  queryClient.setQueryData<LocalMessage[]>(messagesQueryKey(CONVERSATION_ID), initialMessages);

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, Wrapper };
}

// O hook usa crypto.randomUUID via Composer; aqui passamos tempId manual, mas
// alguns helpers internos podem invocar — jsdom já expõe `crypto` em
// versões recentes, então não precisamos polyfill.
beforeEach(() => {
  server.resetHandlers();
});

afterEach(() => {
  // Garante que handlers de um teste não vazem para o próximo mesmo se
  // afterEach do setup já chamar resetHandlers — defesa redundante e barata.
  server.resetHandlers();
});

describe("useSendMessage", () => {
  it("adiciona a mensagem otimista no cache imediatamente após mutate", async () => {
    // Handler que demora 200ms — janela suficiente pra checarmos o estado
    // intermediário (pending=true, mensagem já visível) antes da resposta.
    server.use(
      http.post(`${API_BASE}/conversations/${CONVERSATION_ID}/messages`, async () => {
        await delay(200);
        return HttpResponse.json<Message>({
          id: "server-1",
          direction: "out",
          body: "oi servidor",
          status: "sent",
          createdAt: new Date().toISOString(),
        });
      }),
    );

    const { queryClient, Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSendMessage(CONVERSATION_ID), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ text: "oi servidor", tempId: "temp-1" });
    });

    // onMutate é async (awaita cancelQueries), então o setQueryData roda na
    // próxima microtask — não imediatamente. waitFor aqui captura a bolha
    // otimista *antes* do servidor responder (delay de 200ms acima). Esse é
    // o ponto crítico que diferencia "instantâneo" de "espera a rede": pending
    // ainda é true.
    await waitFor(() => {
      const cached = queryClient.getQueryData<LocalMessage[]>(
        messagesQueryKey(CONVERSATION_ID),
      );
      expect(cached).toHaveLength(1);
      expect(cached?.[0]).toMatchObject({
        id: "optimistic-temp-1",
        body: "oi servidor",
        direction: "out",
        pending: true,
      });
    });

    // Aguarda o success pra deixar o ambiente limpo no fim do teste.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("substitui a otimista pela mensagem real após sucesso", async () => {
    server.use(
      http.post(`${API_BASE}/conversations/${CONVERSATION_ID}/messages`, () => {
        return HttpResponse.json<Message>({
          id: "server-1",
          direction: "out",
          body: "tudo certo",
          status: "delivered",
          createdAt: "2026-06-16T12:00:00.000Z",
        });
      }),
    );

    const { queryClient, Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSendMessage(CONVERSATION_ID), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ text: "tudo certo", tempId: "temp-2" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<LocalMessage[]>(messagesQueryKey(CONVERSATION_ID));
    expect(cached).toHaveLength(1);
    // A entrada otimista (id="optimistic-temp-2") sumiu — foi trocada pela
    // resposta do servidor mantendo a posição no array. Sem pending nem error.
    expect(cached?.[0]).toMatchObject({
      id: "server-1",
      status: "delivered",
      body: "tudo certo",
    });
    expect(cached?.[0].pending).toBeFalsy();
    expect(cached?.[0].error).toBeFalsy();
  });

  it("mantém a mensagem no cache marcada com error=true quando o POST falha", async () => {
    // Regra de produto: NÃO removemos a bolha em erro. O usuário acabou de
    // digitar o texto — sumir com ela é UX pior que mantê-la com indicador
    // de erro + botão de retry. Esse comportamento está documentado em
    // useSendMessage.ts (comentário do onError).
    server.use(
      http.post(`${API_BASE}/conversations/${CONVERSATION_ID}/messages`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { queryClient, Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSendMessage(CONVERSATION_ID), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ text: "falha aqui", tempId: "temp-3" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = queryClient.getQueryData<LocalMessage[]>(messagesQueryKey(CONVERSATION_ID));
    expect(cached).toHaveLength(1);
    expect(cached?.[0]).toMatchObject({
      id: "optimistic-temp-3",
      body: "falha aqui",
      error: true,
      pending: false,
    });
  });

  it("invalida a query de conversations no onSettled (sucesso)", async () => {
    server.use(
      http.post(`${API_BASE}/conversations/${CONVERSATION_ID}/messages`, () =>
        HttpResponse.json<Message>({
          id: "server-x",
          direction: "out",
          body: "sidebar atualiza?",
          status: "sent",
          createdAt: new Date().toISOString(),
        }),
      ),
    );

    const { queryClient, Wrapper } = makeWrapper();

    // Cria uma query observável de conversations pra que o invalidate dispare
    // refetch (sem observer, invalidate apenas marca como stale e o test não
    // captura o efeito). queryFn rejeita: só queremos contar a chamada.
    let conversationsCalls = 0;
    queryClient.setQueryDefaults([...conversationsQueryKey], {
      queryFn: async () => {
        conversationsCalls += 1;
        return [];
      },
    });
    await queryClient.prefetchQuery({ queryKey: [...conversationsQueryKey] });
    expect(conversationsCalls).toBe(1);

    const { result } = renderHook(
      () => {
        // Mantém um observer ativo pra que invalidate dispare refetch.
        useMessages(CONVERSATION_ID);
        return useSendMessage(CONVERSATION_ID);
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.mutate({ text: "x", tempId: "temp-4" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // onSettled marca conversations como invalid; sem observer ativo da query
    // de conversations, o refetch só acontece no próximo mount. Aqui basta
    // verificar que a query ficou marcada como invalidada via state.
    const state = queryClient.getQueryState([...conversationsQueryKey]);
    expect(state?.isInvalidated).toBe(true);
  });
});
