"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage, type LocalMessage, type Message } from "@/lib/api";
import { conversationsQueryKey } from "./useConversations";
import { messagesQueryKey } from "./useMessages";

interface SendVariables {
  text: string;
  // tempId estável fornecido pelo chamador para correlacionar a mensagem
  // otimista com o resultado (sucesso/erro). Permite múltiplos envios em
  // paralelo sem que um onSettled "tardio" altere a mensagem do outro.
  tempId: string;
}

interface MutationContext {
  optimisticId: string;
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const queryKey = messagesQueryKey(conversationId);

  return useMutation<Message, Error, SendVariables, MutationContext>({
    mutationFn: ({ text }) => sendMessage(conversationId, text),

    // onMutate: roda antes da request, sincronamente. É aqui que aplicamos a
    // mensagem otimista para a UI parecer instantânea.
    onMutate: async ({ text, tempId }) => {
      const optimisticId = `optimistic-${tempId}`;

      // Sem o cancelQueries o polling de 3s pode terminar no meio do envio e
      // sobrescrever o cache (que tem nossa mensagem otimista) pela resposta
      // do servidor (que ainda não tem ela) — gerando flash de desaparecer
      // e reaparecer. cancel marca as in-flight como obsoletas.
      await queryClient.cancelQueries({ queryKey });

      const optimistic: LocalMessage = {
        id: optimisticId,
        direction: "out",
        body: text,
        status: "sent",
        createdAt: new Date().toISOString(),
        pending: true,
        draftText: text,
      };

      queryClient.setQueryData<LocalMessage[]>(queryKey, (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { optimisticId };
    },

    // onError: NÃO removemos a mensagem — preservamos no DOM com error=true para
    // o usuário poder retentar. Rollback total sumiria com o texto que ele
    // acabou de digitar, UX pior.
    onError: (_err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData<LocalMessage[]>(queryKey, (old) =>
        (old ?? []).map((m) =>
          m.id === context.optimisticId ? { ...m, pending: false, error: true } : m,
        ),
      );
    },

    // onSuccess: troca a otimista pela "real" do servidor (id real, status real),
    // preservando a ordem original. invalidate posterior (no onSettled) garante
    // ressincronização caso a ordem do servidor difira (ex.: clock skew).
    onSuccess: (serverMsg, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData<LocalMessage[]>(queryKey, (old) =>
        (old ?? []).map((m) => (m.id === context.optimisticId ? serverMsg : m)),
      );
    },

    // onSettled: força ressincronização (cobre clock skew, status que mudou no
    // servidor, etc.) e atualiza a sidebar (lastMessage/lastMessageAt/unread).
    // Roda mesmo em erro — se ainda assim a request chegou, o invalidate pega.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [...conversationsQueryKey] });
    },
  });
}
