export function ConversationListSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 border-l-2 border-l-transparent px-3 py-3">
          <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="h-3 w-32 animate-pulse rounded bg-muted" />
              <span className="h-2.5 w-8 animate-pulse rounded bg-muted" />
            </div>
            <span className="h-2.5 w-48 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}
