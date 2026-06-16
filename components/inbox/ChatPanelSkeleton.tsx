import clsx from "clsx";

// Bolhas alternadas pra dar a sensação certa do layout durante o carregamento inicial.
// Larguras variadas evitam visual "régua" repetitiva.
const PATTERN: Array<{ side: "in" | "out"; width: string }> = [
  { side: "in", width: "w-40" },
  { side: "out", width: "w-56" },
  { side: "in", width: "w-32" },
  { side: "out", width: "w-48" },
  { side: "in", width: "w-44" },
];

export function ChatPanelSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 py-4 md:px-6"
    >
      {PATTERN.map((row, i) => (
        <div
          key={i}
          className={clsx("flex w-full", row.side === "out" ? "justify-end" : "justify-start")}
        >
          <span
            className={clsx(
              "h-10 animate-pulse rounded-lg",
              row.width,
              row.side === "out" ? "bg-bubble-out/70" : "bg-card",
            )}
          />
        </div>
      ))}
    </div>
  );
}
