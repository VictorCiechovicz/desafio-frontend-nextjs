import Link from "next/link";

// Renderizado pelo App Router quando o ChatPanel chama notFound() — caso a
// lista de conversas já carregou mas o id da URL não bate com nenhuma. No
// mobile a sidebar volta a ocupar a tela inteira (data-active=false no layout),
// então este painel só é visto no desktop; mesmo padrão visual do
// EmptyChatState pra manter consistência.
export default function ConversationNotFound() {
  return (
    <section
      aria-label="Conversa não encontrada"
      className="flex h-full flex-1 flex-col items-center justify-center bg-background px-8 text-center"
    >
      <div
        aria-hidden
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-base font-medium text-foreground">Conversa não encontrada</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Talvez ela tenha sido removida ou o link esteja incorreto.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        Voltar para a lista
      </Link>
    </section>
  );
}
