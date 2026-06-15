"use client";

import { useMutation } from "@tanstack/react-query";
import { suggestReply, type AiSuggestion } from "@/lib/api";

export function useSuggestReply(conversationId: string) {
  return useMutation<AiSuggestion, Error, void>({
    mutationFn: () => suggestReply(conversationId),
  });
}
