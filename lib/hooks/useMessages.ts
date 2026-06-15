"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages, type Message } from "@/lib/api";

export const messagesQueryKey = (conversationId: string) =>
  ["messages", conversationId] as const;

// Polling de 3s (vs 5s na sidebar): o chat aberto é o foco do atendente, então
// precisamos refletir respostas do cliente mais rápido. Sem WebSocket, 3s é o
// compromisso entre responsividade percebida e custo de polling. O staleTime
// global (5s) seria curto demais aqui, mas o refetchInterval sobrepõe.
export function useMessages(conversationId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: messagesQueryKey(conversationId ?? ""),
    queryFn: () => getMessages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: 3_000,
  });
}
