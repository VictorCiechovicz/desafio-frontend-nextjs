"use client";

import Link from "next/link";
import clsx from "clsx";
import type { Conversation } from "@/lib/api";
import { formatConversationTimestamp, getInitials } from "@/lib/format";

interface Props {
  conversation: Conversation;
  isActive: boolean;
}

export function ConversationListItem({ conversation, isActive }: Props) {
  const { id, contactName, avatarColor, unread, lastMessage, lastMessageAt } = conversation;
  const initials = getInitials(contactName);
  const timestamp = formatConversationTimestamp(lastMessageAt);
  const hasUnread = unread > 0;

  return (
    <Link
      href={`/c/${id}`}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "flex items-center gap-3 border-l-2 px-3 py-3 transition-colors",
        "hover:bg-neutral-50 focus:outline-none focus-visible:bg-neutral-100",
        isActive
          ? "border-l-[#25D366] bg-neutral-100"
          : "border-l-transparent",
      )}
    >
      <span
        aria-hidden
        style={{ backgroundColor: avatarColor }}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      >
        {initials}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={clsx(
              "truncate text-sm",
              hasUnread ? "font-semibold text-neutral-900" : "font-medium text-neutral-900",
            )}
          >
            {contactName}
          </p>
          {timestamp && (
            <span
              className={clsx(
                "shrink-0 text-[11px]",
                hasUnread ? "text-[#25D366]" : "text-neutral-400",
              )}
            >
              {timestamp}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={clsx(
              "truncate text-xs",
              hasUnread ? "text-neutral-700" : "text-neutral-500",
            )}
          >
            {lastMessage}
          </p>
          {hasUnread && (
            <span
              aria-label={`${unread} ${unread === 1 ? "não lida" : "não lidas"}`}
              className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#25D366] px-1.5 text-[11px] font-semibold text-white"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
