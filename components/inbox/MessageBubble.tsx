import { memo } from "react";
import clsx from "clsx";
import type { Message } from "@/lib/api";
import { formatMessageTime } from "@/lib/format";
import { ChatMessageStatus } from "./ChatMessageStatus";

interface Props {
  message: Message;
}

// memo() porque o polling de 3s refaz a array de mensagens; sem isso toda bolha
// re-renderiza mesmo que a referência do objeto Message não mude. Como o id é
// estável, a comparação rasa do memo é suficiente.
function MessageBubbleImpl({ message }: Props) {
  const isOut = message.direction === "out";
  const time = formatMessageTime(message.createdAt);

  return (
    <div className={clsx("flex w-full", isOut ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[78%] rounded-lg px-3 py-2 text-sm shadow-sm md:max-w-[65%]",
          isOut
            ? "rounded-tr-sm bg-[#DCF8C6] text-neutral-900"
            : "rounded-tl-sm border border-neutral-200 bg-white text-neutral-900",
        )}
      >
        {/* Prefixo somente para leitores de tela; visualmente a direção da bolha já comunica. */}
        <span className="sr-only">
          {isOut ? "Sua mensagem" : "Mensagem do cliente"} às {time}:{" "}
        </span>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.body}</p>
        <div
          aria-hidden
          className="mt-1 flex items-center justify-end gap-1 text-[10px] text-neutral-500"
        >
          <span>{time}</span>
          {isOut && <ChatMessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleImpl);
