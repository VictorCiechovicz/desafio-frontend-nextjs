"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";

export function AgentHeader() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-xs font-semibold text-white"
        >
          M
        </span>
        <h1 className="text-sm font-semibold text-neutral-900">Inbox de Atendimento</h1>
      </div>

      <div className="text-right text-xs">
        {isLoading && <span className="text-neutral-400">Carregando…</span>}
        {isError && <span className="text-red-600">Sem conexão</span>}
        {data && (
          <div className="leading-tight">
            <p className="font-medium text-neutral-900">{data.name}</p>
            <p className="text-neutral-500">{data.role}</p>
          </div>
        )}
      </div>
    </header>
  );
}
