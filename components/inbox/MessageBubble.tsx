import { memo } from "react";
import clsx from "clsx";
import type { LocalMessage } from "@/lib/api";
import { formatMessageTime } from "@/lib/format";
import { ChatMessageStatus } from "./ChatMessageStatus";

interface Props {
  message: LocalMessage;
  // Chamado apenas quando o usuário clica em "Tentar novamente" numa bolha que
  // falhou. Opcional para suportar uso no histórico (mensagens já confirmadas
  // nunca exibem retry).
  onRetry?: (message: LocalMessage) => void;
}

// memo() porque o polling de 3s refaz a array de mensagens; sem isso toda bolha
// re-renderiza mesmo que a referência do objeto Message não mude. Como o id é
// estável, a comparação rasa do memo é suficiente. onRetry deve ser estabilizado
// (useCallback) no pai para a memoização não quebrar.
function MessageBubbleImpl({ message, onRetry }: Props) {
  const isOut = message.direction === "out";
  const time = formatMessageTime(message.createdAt);
  const isPending = message.pending === true;
  const isError = message.error === true;

  return (
    <div className={clsx("flex w-full", isOut ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[78%] rounded-lg px-3 py-2 text-sm shadow-sm md:max-w-[65%]",
          isOut
            ? "rounded-tr-sm bg-[#DCF8C6] text-neutral-900"
            : "rounded-tl-sm border border-neutral-200 bg-white text-neutral-900",
          isPending && "opacity-70",
          isError && "border border-red-400/80",
        )}
      >
        {/* Prefixo somente para leitores de tela; visualmente a direção da bolha já comunica. */}
        <span className="sr-only">
          {isOut ? "Sua mensagem" : "Mensagem do cliente"} às {time}
          {isPending ? ", enviando" : ""}
          {isError ? ", falha ao enviar" : ""}:{" "}
        </span>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.body}</p>

        {isError && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-3.5 w-3.5 shrink-0"
            >
              <circle cx="8" cy="8" r="6.5" />
              <line x1="8" y1="5" x2="8" y2="9" />
              <line x1="8" y1="11" x2="8" y2="11.01" />
            </svg>
            <span>Falha ao enviar.</span>
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(message)}
                className="font-semibold underline underline-offset-2 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
              >
                Tentar novamente?
              </button>
            )}
          </div>
        )}

        <div
          aria-hidden
          className="mt-1 flex items-center justify-end gap-1 text-[10px] text-neutral-500"
        >
          <span>{time}</span>
          {isOut && !isError && (
            <ChatMessageStatus status={message.status} pending={isPending} />
          )}
        </div>
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleImpl);
