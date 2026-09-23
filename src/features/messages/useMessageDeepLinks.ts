import { useCallback, useEffect, useRef } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { Conversation } from "./data";
import { buildRecipientConversation } from "./recipient";
import { saveDraft } from "./drafts";
import { findDemoConversation } from "./api/demoThreadCache";
import { getConversation } from "./api/messages.api";
import {
  conversationToView,
  type ConversationWithPreview,
} from "./api/messages.adapters";
import { isServerConversationId } from "./useMessagesController.helpers";
import {
  MAILBOX_PARAM,
  useActiveMailbox,
  type ActiveMailbox,
} from "./mailboxes/useActiveMailbox";

interface DeepLinksDeps {
  allThreads: Conversation[];
  /** From the navigation sub-hook — opens (and marks read) an existing thread. */
  openThread: (id: string) => void;
  /** From the navigation sub-hook — opens a thread and arms a scroll-to +
   *  highlight of one of its messages (the same mechanism a cross-inbox
   *  search/starred pick uses). Falls back to a plain `openThread` when no
   *  message id is present. */
  openThreadAtMessage: (conversationId: string, messageId?: string) => void;
  /** From the thread-creation sub-hook — find-or-creates a thread for a
   *  recipient. */
  startThread: (recipient: Conversation) => void;
}

/** A thread's mailbox as read by id. `mailboxIdentityId` is undefined for a
 *  personal thread or a group. */
interface ThreadMailbox {
  mailboxIdentityId?: string;
}

/** The mailbox a thread belongs to, read by id: the demo registry, or the
 *  same `["conversation-detail", id, demoMode]` entry `useConversationDetail`
 *  fills.
 *
 *  - `null`: the thread is simply unknown (demo only, an id no seed owns).
 *  - `"refused"` (live only): the read itself failed. Most often the member
 *    staffed this thread's mailbox and lost the seat since the link was
 *    made (moderation, or leaving the team), so `requireParticipant` on the
 *    backend no longer recognizes them at all and the detail read 404s
 *    outright. The ordinary customer case (a ?c= into a business's thread
 *    the member merely reads as a customer) still answers fine, resolves as
 *    a `ThreadMailbox` below, and keeps falling back to the personal
 *    mailbox the same way it always has.
 */
export async function resolveThreadMailbox(
  conversationId: string,
  demoMode: boolean,
  queryClient: QueryClient,
  t: TFunction,
): Promise<ThreadMailbox | "refused" | null> {
  if (demoMode) {
    const conversation = findDemoConversation(conversationId);
    return conversation
      ? { mailboxIdentityId: conversation.mailboxIdentityId }
      : null;
  }
  if (!isServerConversationId(conversationId)) return null;
  try {
    const detail = await queryClient.fetchQuery<ConversationWithPreview>({
      queryKey: ["conversation-detail", conversationId, demoMode],
      queryFn: async () =>
        conversationToView(await getConversation(conversationId), t),
    });
    return { mailboxIdentityId: detail.mailboxIdentityId };
  } catch {
    return "refused";
  }
}

/**
 * A push opens `/messages?c=<id>` with no `?as=` (the backend's deep link
 * carries no mailbox). When `c` is not in the scoped list, read the thread's
 * mailbox and switch to it, keeping `c` and `m`, so the open effect below
 * finds it once the scoped list holds it. A thread of a mailbox the member
 * does not staff is personal. A thread the member cannot read at all any
 * more (`resolveThreadMailbox` returning `"refused"`, most often a mailbox
 * they were staffing and lost) clears the dangling `c`/`m`, says so, and
 * leaves the currently active mailbox alone. Each `c` is resolved once.
 */
function useCrossMailboxDeepLink(
  allThreads: Conversation[],
  activeMailbox: ActiveMailbox,
): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const resolvedConversationIdRef = useRef<string | null>(null);
  const conversationId = searchParams.get("c");
  const {
    scope,
    active,
    profileMailbox,
    staffedIdentityIds,
    switchMailboxKeepingThread,
  } = activeMailbox;
  const isInScopedList =
    !!conversationId &&
    allThreads.some((thread) => thread.id === conversationId);

  const clearDeepLinkParams = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("c");
        next.delete("m");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  useEffect(() => {
    if (!conversationId || !scope || isInScopedList) return;
    if (resolvedConversationIdRef.current === conversationId) return;
    resolvedConversationIdRef.current = conversationId;
    void resolveThreadMailbox(conversationId, demoMode, queryClient, t).then(
      (threadMailbox) => {
        if (threadMailbox === "refused") {
          clearDeepLinkParams();
          showToast(t("messages:mailbox.lostAccess"), "info");
          return;
        }
        if (!threadMailbox) return;
        const { mailboxIdentityId } = threadMailbox;
        const targetIdentityId =
          mailboxIdentityId && staffedIdentityIds.has(mailboxIdentityId)
            ? mailboxIdentityId
            : profileMailbox?.identityId;
        if (targetIdentityId && targetIdentityId !== active?.identityId) {
          switchMailboxKeepingThread(targetIdentityId);
        }
      },
    );
  }, [
    conversationId,
    scope,
    isInScopedList,
    demoMode,
    queryClient,
    t,
    staffedIdentityIds,
    profileMailbox,
    active,
    switchMailboxKeepingThread,
    clearDeepLinkParams,
    showToast,
  ]);
}

/**
 * The three deep-link effects: "Message <member>" (`location.state.to`), the
 * notification-tap `?c=<conversationId>` param, and its optional
 * `&m=<messageId>` sibling (a mention notification's href, or any future
 * per-message deep link) that additionally scrolls to and highlights the
 * named message once the thread is open. All materialize or open a thread, so
 * they live together. Extracted from `useMessageCreation`.
 *
 * Mailboxes: "Message <member>" always lands in the personal mailbox (a
 * business never starts a conversation), and `?c=` switches to the thread's
 * own mailbox first when the active one does not hold it.
 */
export function useMessageDeepLinks({
  allThreads,
  openThread,
  openThreadAtMessage,
  startThread,
}: DeepLinksDeps): void {
  const location = useLocation();
  const navigate = useNavigate();
  const activeMailbox = useActiveMailbox();
  useCrossMailboxDeepLink(allThreads, activeMailbox);
  // The hand-off waits for the mailboxes, and runs on the personal mailbox
  // only. A failed mailbox list leaves the inbox on the member's own seat,
  // so the hand-off runs then too.
  const isMailboxSettled =
    activeMailbox.scope !== null || activeMailbox.isError;
  const isOnPersonalMailbox = activeMailbox.isPersonal;
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
    if (!pendingRecipient || !isMailboxSettled) return;
    if (!isOnPersonalMailbox) {
      // Switch to the personal mailbox first, carrying the hand-off along in
      // `state`; this effect runs again once the personal mailbox is active.
      const params = new URLSearchParams(location.search);
      for (const param of [MAILBOX_PARAM, "c", "m", "tab"]) {
        params.delete(param);
      }
      const search = params.toString();
      void navigate(
        { pathname: location.pathname, search: search ? `?${search}` : "" },
        { replace: true, state: location.state as unknown },
      );
      return;
    }
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
  }, [pendingRecipient?.slug, isMailboxSettled, isOnPersonalMailbox]);

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
    // One-shot notification-tap deep-link; the `c` (and optional `m`) params
    // are cleared right after. `m` is the server message id to scroll to +
    // highlight — e.g. a mention notification's href — once the thread is
    // open; omitted, this behaves exactly like the plain `c`-only tap it
    // always has. Only `c` and `m` are cleared, so `?as=` (the active
    // mailbox) and every other view param stay.
    const messageId = searchParams.get("m") ?? undefined;
    openThreadAtMessage(conversationId, messageId);
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("c");
        next.delete("m");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allThreads, setSearchParams]);
}
