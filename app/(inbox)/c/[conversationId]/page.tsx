import { ChatPanel } from "@/components/inbox/ChatPanel";

// Next 15: params é Promise.
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <ChatPanel conversationId={conversationId} />;
}
