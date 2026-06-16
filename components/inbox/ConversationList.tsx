"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Conversation } from "@/lib/api";
import { useConversations } from "@/lib/hooks/useConversations";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import { ConversationListItem } from "./ConversationListItem";
import { ConversationListSkeleton } from "./ConversationListSkeleton";
import { ConversationListEmpty } from "./ConversationListEmpty";
import { ConversationSearchInput } from "./ConversationSearchInput";

export function ConversationList() {
  const pathname = usePathname();
  const activeId = pathname.startsWith("/c/") ? pathname.slice(3) : null;

  const [query, setQuery] = useState("");
  const { data, isPending, isError, refetch, isFetching } = useConversations();

  // Debounce mantém o "Atualizando…" silencioso durante o polling normal de 5s.
  // Só aparece quando o refetch demora — sinaliza rede ruim sem virar ruído.
  const showRefreshIndicator = useDelayedFlag(isFetching && !isPending);

  const filtered = useMemo(() => filterConversations(data ?? [], query), [data, query]);

  return (
    <aside
      aria-label="Lista de conversas"
      data-active={activeId ? "true" : "false"}
      className="flex h-full w-full flex-col border-r border-border bg-card data-[active=true]:hidden md:flex md:w-[360px] md:shrink-0 md:data-[active=true]:flex"
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-border px-3 py-3">
        <div className="flex h-6 items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Conversas</h2>
          {showRefreshIndicator && (
            <span aria-hidden className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Atualizando…
            </span>
          )}
        </div>
        <ConversationSearchInput value={query} onChange={setQuery} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {isPending ? (
          <ConversationListSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (data?.length ?? 0) === 0 ? (
          <ConversationListEmpty variant="no-conversations" />
        ) : filtered.length === 0 ? (
          <ConversationListEmpty variant="no-results" query={query} />
        ) : (
          <ul className="flex flex-col">
            {filtered.map((c) => (
              <li key={c.id}>
                <ConversationListItem conversation={c} isActive={c.id === activeId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function filterConversations(list: Conversation[], rawQuery: string): Conversation[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (c) =>
      c.contactName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q),
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="mb-3 text-sm text-foreground">Não foi possível carregar as conversas.</p>
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
