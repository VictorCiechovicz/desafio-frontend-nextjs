"use client";

// Client porque a tela de chat vai precisar de useQuery, useMutation (envio otimista),
// polling, foco no input e scroll automático.
export function ChatPanel({ conversationId }: { conversationId: string }) {
  return (
    <section
      aria-label={`Conversa ${conversationId}`}
      className="flex h-full flex-1 flex-col bg-neutral-50"
    >
      <div className="flex h-12 shrink-0 items-center border-b border-neutral-200 bg-white px-4">
        <h2 className="text-sm font-semibold text-neutral-900">
          {/* TODO: nome do contato vindo da conversa selecionada */}
          Chat de {conversationId}
        </h2>
      </div>

      <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
        {/* TODO: lista de mensagens (bolhas in/out) + composer + botão sugerir IA */}
        Chat (TODO)
      </div>
    </section>
  );
}
