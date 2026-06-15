interface Props {
  variant: "no-conversations" | "no-results";
  query?: string;
}

export function ConversationListEmpty({ variant, query }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <span
        aria-hidden
        className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {variant === "no-conversations" ? (
            <>
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </>
          ) : (
            <>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </>
          )}
        </svg>
      </span>
      <p className="text-sm text-neutral-500">
        {variant === "no-conversations" ? (
          "Nenhuma conversa ainda"
        ) : (
          <>
            Nenhum resultado para <span className="font-medium text-neutral-700">&ldquo;{query}&rdquo;</span>
          </>
        )}
      </p>
    </div>
  );
}
