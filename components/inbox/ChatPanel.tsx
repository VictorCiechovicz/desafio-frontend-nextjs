"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LocalMessage } from "@/lib/api";
import { useConversation } from "@/lib/hooks/useConversations";
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
  const showRefreshIndicator = (isFetching && !isPending) || isFetchingConversation;

  return (
    <section
      aria-label={
        conversation ? `Conversa com ${conversation.contactName}` : "Carregando conversa"
      }
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <ChatHeader conversation={conversation} isFetching={showRefreshIndicator} />

      {/* Background tipo "papel de parede" do WhatsApp clássico, diferenciando o
          painel do branco da sidebar. Usamos cor sólida + leve gradiente. */}
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{
          backgroundColor: "#E5DDD5",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.04) 0, transparent 45%)",
        }}
      >
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
      <p className="mb-3 text-sm text-neutral-800">
        Não foi possível carregar as mensagens.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1ebe5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function EmptyMessagesState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
      <p className="text-sm text-neutral-600">Nenhuma mensagem ainda.</p>
    </div>
  );
}
