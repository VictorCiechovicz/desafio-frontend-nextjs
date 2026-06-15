import clsx from "clsx";
import type { Message } from "@/lib/api";

interface Props {
  status: Message["status"];
  // Estado puramente client-side: mensagem otimista ainda não confirmada pelo
  // servidor. Sobrepõe o status real (que vem como "sent" no objeto otimista)
  // e renderiza um relógio em vez de checks. Não estendemos Message["status"]
  // pra não misturar tipo do backend com transient state.
  pending?: boolean;
}

const LABEL: Record<Message["status"], string> = {
  sent: "Enviado",
  delivered: "Entregue",
  read: "Lido",
};

// Ícones inline (sem dep extra). "sent" = 1 check; "delivered"/"read" = 2 checks.
// "read" muda a cor pra azul WhatsApp (#34B7F1). Quando pending, troca pelo ícone
// de relógio (mesmo padrão visual do WhatsApp pra mensagens em trânsito).
export function ChatMessageStatus({ status, pending }: Props) {
  if (pending) {
    return (
      <span
        role="img"
        aria-label="Enviando"
        className="inline-flex shrink-0 items-center text-neutral-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-3.5 w-3.5"
        >
          <circle cx="8" cy="8" r="6.5" />
          <polyline points="8,4.5 8,8 10.5,9.5" />
        </svg>
      </span>
    );
  }

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
