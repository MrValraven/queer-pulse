import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { Conversation } from "./data";
import { buildRecipientConversation } from "./recipient";
import { saveDraft } from "./drafts";

interface DeepLinksDeps {
  allThreads: Conversation[];
  /** From the navigation sub-hook — opens (and marks read) an existing thread. */
  openThread: (id: string) => void;
  /** From the thread-creation sub-hook — find-or-creates a thread for a
   *  recipient. */
  startThread: (recipient: Conversation) => void;
}

/**
 * The two deep-link effects: "Message <member>" (`location.state.to`) and the
 * notification-tap `?c=<conversationId>` param. Both materialize or open a
 * thread, so they live together. Extracted from `useMessageCreation`;
 * behaviour is unchanged.
 */
export function useMessageDeepLinks({
  allThreads,
  openThread,
  startThread,
}: DeepLinksDeps): void {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingRecipient = (
    location.state as {
      to?: { slug: string; name: string; text?: string };
    } | null
  )?.to;

  // One-shot: honor a "Message <member>" deep-link. Open the existing thread for
  // that slug, or seed+start a new one. Clear the state so back/refresh doesn't
  // re-fire. Works in both modes; live also find-or-creates via startThread.
  // An optional `text` (e.g. "invite a friend to this gathering") seeds the
  // composer's draft rather than sending automatically, so the inviter can
  // still edit or add a note before hitting send.
  useEffect(() => {
    if (!pendingRecipient) return;
    const existingThread = allThreads.find(
      (thread) => thread.slug === pendingRecipient.slug,
    );
    if (existingThread) {
      // One-shot "Message <member>" deep-link; cleared via navigate replace below.
      openThread(existingThread.id);
      if (pendingRecipient.text)
        saveDraft(existingThread.id, pendingRecipient.text);
    } else {
      const recipient = buildRecipientConversation(
        pendingRecipient.slug,
        pendingRecipient.name,
      );
      startThread(recipient);
      if (pendingRecipient.text) saveDraft(recipient.id, pendingRecipient.text);
    }
    void navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRecipient?.slug]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Notification tap deep-link: the service worker's notificationclick opens
  // `/messages?c=<conversationId>`. Wait until the inbox actually contains
  // that conversation (it may still be loading), then open it the same way a
  // normal thread-row tap does — on mobile the thread pane is gated on
  // `view === "thread"`, so just setting `activeId` selects the conversation
  // without ever showing it — and clear the param so it can't re-fire on a
  // later manual thread switch. Coexists with the pendingRecipient effect
  // above: that one deep-links to a person (existing-or-new thread via slug),
  // this one deep-links to an existing conversation by id.
  useEffect(() => {
    const conversationId = searchParams.get("c");
    if (!conversationId) return;
    const exists = allThreads.some((thread) => thread.id === conversationId);
    if (!exists) return;
    // One-shot notification-tap deep-link; the `c` param is cleared right after.
    openThread(conversationId);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allThreads, setSearchParams]);
}
