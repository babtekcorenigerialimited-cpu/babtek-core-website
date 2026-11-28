"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Props = {
  title: string;
  subtitle: string;
  messageIds: string[];
  unreadCount: number;
  children: ReactNode;
};

export function ConversationThread({ title, subtitle, messageIds, unreadCount, children }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);

  async function handleToggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
    const open = event.currentTarget.open;
    setIsOpen(open);
    if (!open || marked || marking || messageIds.length === 0) return;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    setMarking(true);
    const supabase = createBrowserClient(url, key);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!authError && user) {
      const { error } = await supabase
        .from("communication_message_reads")
        .upsert(
          messageIds.map((message_id) => ({ message_id, reader_id: user.id })),
          { onConflict: "message_id,reader_id", ignoreDuplicates: true }
        );
      if (!error) {
        setMarked(true);
        router.refresh();
      } else {
        console.error("Conversation read receipts could not be saved", error.message);
      }
    }
    setMarking(false);
  }

  return (
    <details className="admin-comms-thread conversation-thread" onToggle={handleToggle}>
      <summary className="admin-comms-thread-head conversation-thread-summary">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="conversation-thread-status">
          {marking ? "Updating…" : unreadCount > 0 && !marked ? unreadCount + " unread" : isOpen ? "Opened" : "Open conversation"}
        </span>
      </summary>
      <div className="conversation-thread-content">{children}</div>
    </details>
  );
}
