// No mobile, quando não há conversa selecionada, a sidebar já ocupa a tela toda;
// esse estado vazio só aparece no desktop (md:flex).
export function EmptyChatState() {
  return (
    <section
      aria-label="Nenhuma conversa selecionada"
      className="hidden h-full flex-1 flex-col items-center justify-center bg-neutral-50 px-8 text-center md:flex"
    >
      <div
        aria-hidden
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]"
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
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </div>
      <h2 className="text-base font-medium text-neutral-900">Selecione uma conversa</h2>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">
        Escolha um contato na lista à esquerda para começar a responder.
      </p>
    </section>
  );
}
