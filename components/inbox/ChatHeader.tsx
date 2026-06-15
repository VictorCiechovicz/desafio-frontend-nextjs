"use client";

import Link from "next/link";
import type { Conversation } from "@/lib/api";
import { getInitials } from "@/lib/format";

interface Props {
  conversation: Conversation | undefined;
  isFetching: boolean;
}

export function ChatHeader({ conversation, isFetching }: Props) {
  if (!conversation) {
    return (
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-3 md:px-4">
        <BackButton />
        <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-neutral-200" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="h-3 w-32 animate-pulse rounded bg-neutral-200" />
          <span className="h-2.5 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
      </header>
    );
  }

  const initials = getInitials(conversation.contactName);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-3 md:px-4">
      <BackButton />
      <span
        aria-hidden
        style={{ backgroundColor: conversation.avatarColor }}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      >
        {initials}
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <p className="truncate text-sm font-semibold text-neutral-900">
          {conversation.contactName}
        </p>
        <p className="truncate text-xs text-neutral-500">{conversation.contactPhone}</p>
      </div>
      {isFetching && (
        <span aria-hidden className="text-[10px] uppercase tracking-wide text-neutral-400">
          Atualizando…
        </span>
      )}
    </header>
  );
}

function BackButton() {
  return (
    <Link
      href="/"
      aria-label="Voltar para conversas"
      className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 md:hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-5 w-5"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </Link>
  );
}
