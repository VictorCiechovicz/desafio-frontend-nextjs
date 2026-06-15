import clsx from "clsx";
import type { Message } from "@/lib/api";

interface Props {
  status: Message["status"];
}

const LABEL: Record<Message["status"], string> = {
  sent: "Enviado",
  delivered: "Entregue",
  read: "Lido",
};

// Ícones inline (sem dep extra). "sent" = 1 check; "delivered"/"read" = 2 checks.
// "read" muda a cor pra azul WhatsApp (#34B7F1).
export function ChatMessageStatus({ status }: Props) {
  const isDouble = status === "delivered" || status === "read";
  const isRead = status === "read";

  return (
    <span
      role="img"
      aria-label={LABEL[status]}
      className={clsx(
        "inline-flex shrink-0 items-center",
        isRead ? "text-[#34B7F1]" : "text-neutral-500",
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-3.5 w-4"
      >
        {isDouble && <polyline points="1,6 4,9 10,2" />}
        <polyline points={isDouble ? "5,6 8,9 15,2" : "3,6 6,9 13,2"} />
      </svg>
    </span>
  );
}
