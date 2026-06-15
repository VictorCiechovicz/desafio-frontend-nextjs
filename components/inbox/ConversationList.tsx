"use client";

import { usePathname } from "next/navigation";

// Client porque vai consumir useQuery + usePathname (estado de seleção) nas próximas iterações.
export function ConversationList() {
  const pathname = usePathname();
  const activeId = pathname.startsWith("/c/") ? pathname.slice(3) : null;

  return (
    <aside
      aria-label="Lista de conversas"
      data-active={activeId ? "true" : "false"}
      // No mobile esconde quando há conversa ativa (data-active=true). Desktop sempre visível.
      className="flex h-full w-full flex-col border-r border-neutral-200 bg-white data-[active=true]:hidden md:flex md:w-[360px] md:shrink-0"
    >
      <div className="flex h-12 shrink-0 items-center border-b border-neutral-200 px-4">
        <h2 className="text-sm font-semibold text-neutral-900">Conversas</h2>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-neutral-400">
        {/* TODO: substituir por lista real via useConversations() + busca + indicador de não-lidas */}
        <div>
          <p>Lista de conversas (TODO)</p>
          {activeId && <p className="mt-2 text-xs">Ativa: {activeId}</p>}
        </div>
      </div>
    </aside>
  );
}
