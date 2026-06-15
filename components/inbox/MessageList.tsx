"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import type { LocalMessage } from "@/lib/api";
import { dayKey, formatDayDivider } from "@/lib/format";
import { MessageBubble } from "./MessageBubble";
import { MessageDayDivider } from "./MessageDayDivider";

interface Props {
  messages: LocalMessage[];
  onRetry?: (message: LocalMessage) => void;
}

// Margem (px) a partir do final da lista dentro da qual ainda consideramos que
// o usuário está "acompanhando" o chat. Se ele rolou pra cima além disso (lendo
// histórico), respeitamos a posição e NÃO forçamos scroll quando chegar
// mensagem nova — UX padrão de apps de chat.
const STICK_TO_BOTTOM_THRESHOLD_PX = 80;

interface DayGroup {
  key: string;
  label: string;
  messages: LocalMessage[];
}

function groupByDay(messages: LocalMessage[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const msg of messages) {
    const key = dayKey(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.messages.push(msg);
    } else {
      groups.push({ key, label: formatDayDivider(msg.createdAt), messages: [msg] });
    }
  }
  return groups;
}

export function MessageList({ messages, onRetry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousLengthRef = useRef(0);
  const hasMountedRef = useRef(false);

  const groups = useMemo(() => groupByDay(messages), [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const length = messages.length;
    const previousLength = previousLengthRef.current;
    previousLengthRef.current = length;

    // Primeiro paint da lista: ancora no final sem animação pra evitar flash visual.
    if (!hasMountedRef.current && length > 0) {
      hasMountedRef.current = true;
      container.scrollTop = container.scrollHeight;
      return;
    }

    if (length <= previousLength) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom <= STICK_TO_BOTTOM_THRESHOLD_PX) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Histórico de mensagens"
      className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 md:px-6"
    >
      {groups.map((group) => (
        <Fragment key={group.key}>
          <MessageDayDivider label={group.label} />
          {group.messages.map((message) => (
            <MessageBubble key={message.id} message={message} onRetry={onRetry} />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
