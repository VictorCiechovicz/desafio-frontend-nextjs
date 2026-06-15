"use client";

import { useQuery } from "@tanstack/react-query";
import { getConversations, type Conversation } from "@/lib/api";

export const conversationsQueryKey = ["conversations"] as const;

// Polling de 5s: a sidebar é a porta de entrada e precisa refletir mensagens novas
// chegando em conversas que NÃO estão abertas (unread + lastMessage). 5s é um
// compromisso entre "parece tempo real" e não martelar a API enquanto não há
// WebSocket. O staleTime global (5s) impede refetch duplicado em remounts.
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: [...conversationsQueryKey],
    queryFn: getConversations,
    refetchInterval: 5_000,
  });
}

// Reusa o cache de useConversations() pra evitar uma request extra a
// /conversations/:id (que nem existe na API). select() roda no client e extrai a
// conversa atual da lista já em memória — assim o header do chat aparece
// instantaneamente quando o usuário clica na sidebar, e ainda funciona via deep
// link (entra direto em /c/:id) assim que a lista é carregada.
export function useConversation(conversationId: string | undefined) {
  return useQuery<Conversation[], Error, Conversation | undefined>({
    queryKey: [...conversationsQueryKey],
    queryFn: getConversations,
    refetchInterval: 5_000,
    enabled: Boolean(conversationId),
    select: (list) => list.find((c) => c.id === conversationId),
  });
}
