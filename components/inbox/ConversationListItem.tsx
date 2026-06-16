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
        "hover:bg-muted focus:outline-none focus-visible:bg-muted",
        isActive
          ? "border-l-primary bg-muted"
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
              hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground",
            )}
          >
            {contactName}
          </p>
          {timestamp && (
            <span
              className={clsx(
                "shrink-0 text-[11px]",
                hasUnread ? "text-primary" : "text-muted-foreground",
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
              hasUnread ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {lastMessage}
          </p>
          {hasUnread && (
            <span
              aria-label={`${unread} ${unread === 1 ? "não lida" : "não lidas"}`}
              className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
