import { AgentHeader } from "@/components/inbox/AgentHeader";
import { ConversationList } from "@/components/inbox/ConversationList";

// Server Component: só compõe a shell. AgentHeader e ConversationList isolam o "use client".
export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <AgentHeader />
      <div className="flex min-h-0 flex-1" data-inbox-shell>
        <ConversationList />
        {children}
      </div>
    </div>
  );
}
