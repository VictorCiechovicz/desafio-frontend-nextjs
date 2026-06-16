"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";

export function AgentHeader() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          M
        </span>
        <h1 className="text-sm font-semibold text-foreground">Inbox de Atendimento</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right text-xs">
          {isLoading && <span className="text-muted-foreground">Carregando…</span>}
          {isError && <span className="text-red-600 dark:text-red-400">Sem conexão</span>}
          {data && (
            <div className="leading-tight">
              <p className="font-medium text-foreground">{data.name}</p>
              <p className="text-muted-foreground">{data.role}</p>
            </div>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
