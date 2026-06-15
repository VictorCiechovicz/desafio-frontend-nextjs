"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages, type LocalMessage } from "@/lib/api";

export const messagesQueryKey = (conversationId: string) =>
  ["messages", conversationId] as const;

// Polling de 3s (vs 5s na sidebar): o chat aberto é o foco do atendente, então
// precisamos refletir respostas do cliente mais rápido. Sem WebSocket, 3s é o
// compromisso entre responsividade percebida e custo de polling. O staleTime
// global (5s) seria curto demais aqui, mas o refetchInterval sobrepõe.
//
// O tipo do cache é LocalMessage[] (e não Message[]) porque o useSendMessage
// faz optimistic update injetando mensagens com pending/error que ainda não
// existem no servidor. Como LocalMessage estende Message, o queryFn que devolve
// Message[] é assinatura-compatível (TS faz o widening implícito no setQueryData).
export function useMessages(conversationId: string | undefined) {
  return useQuery<LocalMessage[]>({
    queryKey: messagesQueryKey(conversationId ?? ""),
    queryFn: () => getMessages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: 3_000,
  });
}
