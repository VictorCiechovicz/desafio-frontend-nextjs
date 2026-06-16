"use client";

import { useCallback } from "react";
import { notFound } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { LocalMessage } from "@/lib/api";
import { useConversation, useConversations } from "@/lib/hooks/useConversations";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import { messagesQueryKey, useMessages } from "@/lib/hooks/useMessages";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import { ChatHeader } from "./ChatHeader";
import { ChatPanelSkeleton } from "./ChatPanelSkeleton";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

interface Props {
  conversationId: string;
}

export function ChatPanel({ conversationId }: Props) {
  const queryClient = useQueryClient();

  // Fonte da verdade pra existência da conversa: a lista (a API não tem
  // GET /conversations/:id). Só consideramos "não existe" depois que a lista
  // carregou com sucesso (isSuccess) — durante o primeiro fetch, undefined
  // é estado intermediário, não 404.
  const { data: conversationsList, isSuccess: hasLoadedConversations } = useConversations();
  if (
    hasLoadedConversations &&
    conversationsList &&
    !conversationsList.some((c) => c.id === conversationId)
  ) {
    notFound();
  }

  const { data: conversation, isFetching: isFetchingConversation } =
    useConversation(conversationId);

  const {
    data: messages,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useMessages(conversationId);

  // O retry vive aqui (no orquestrador) porque precisa de duas operações
  // coordenadas: limpar a mensagem antiga (que está com error=true) e disparar
  // um novo envio com tempId novo. Manter no Composer obrigaria o Composer a
  // conhecer o cache; manter na bolha acoplaria a UI ao react-query.
  const retryMutation = useSendMessage(conversationId);

  const handleRetry = useCallback(
    (message: LocalMessage) => {
      const draft = message.draftText ?? message.body;
      if (!draft) return;

      queryClient.setQueryData<LocalMessage[]>(
        messagesQueryKey(conversationId),
        (old) => (old ?? []).filter((m) => m.id !== message.id),
      );

      const tempId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      retryMutation.mutate({ text: draft, tempId });
    },
    [conversationId, queryClient, retryMutation],
  );

  // O "Atualizando…" deve aparecer apenas em refetches do polling, nunca no
  // primeiro carregamento (que já mostra skeleton). Sem isso o usuário veria
  // os dois indicadores ao mesmo tempo.
  //
  // O debounce (useDelayedFlag) evita o flicker do polling de 3s: em rede
  // saudável o refetch termina antes do delay e o indicador nem aparece.
  // Só fica visível quando o fetch realmente atrasa — que é o caso em que
  // o feedback é útil pro atendente.
  const isRefreshing = (isFetching && !isPending) || isFetchingConversation;
  const showRefreshIndicator = useDelayedFlag(isRefreshing);

  return (
    <section
      aria-label={
        conversation ? `Conversa com ${conversation.contactName}` : "Carregando conversa"
      }
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <ChatHeader conversation={conversation} isFetching={showRefreshIndicator} />

      {/* Background tipo "papel de parede" do WhatsApp clássico, diferenciando o
          painel do fundo da sidebar. Cor sólida via token (--chat-bg) cobre light/dark. */}
      <div className="flex min-h-0 flex-1 flex-col bg-chat-bg">
        {isPending ? (
          <ChatPanelSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (messages?.length ?? 0) === 0 ? (
          <EmptyMessagesState />
        ) : (
          <MessageList messages={messages ?? []} onRetry={handleRetry} />
        )}
      </div>

      <Composer conversationId={conversationId} />
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="mb-3 text-sm text-foreground">
        Não foi possível carregar as mensagens.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function EmptyMessagesState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
    </div>
  );
}
