import { ApiError } from "../../../shared/api/client";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import type { Conversation } from "../data";

/**
 * The mailbox a list, search or starred call reads. Every live list call
 * names one: the personal mailbox sends the member's own profile identity id
 * (`GET /conversations?as=<profile identity>` answers personal threads plus
 * groups), and a business, persona or company mailbox sends its own id.
 */
export interface ConversationListScope {
  identityId: string;
  isPersonal: boolean;
  /** A persona moderation removed: readable, and nothing can be sent as it. */
  isReadOnly: boolean;
  /** Every listing, persona and company identity the member answers for. */
  staffedIdentityIds: ReadonlySet<string>;
}

/** The cache-key segment when no mailbox has resolved yet. */
const UNRESOLVED_SCOPE_KEY = "unresolved";

/**
 * Demo only: the mirror of what the server's `as` filter returns. The
 * personal mailbox holds every thread with no mailbox and every thread whose
 * mailbox the member does not staff (they are its customer there); a business
 * mailbox holds its own threads. Live code never filters server rows with it:
 * the server already put each thread in exactly one mailbox's list.
 */
export function belongsToMailbox(
  conversation: Pick<Conversation, "mailboxIdentityId">,
  scope: ConversationListScope,
): boolean {
  const mailboxIdentityId = conversation.mailboxIdentityId;
  const isStaffedThread =
    !!mailboxIdentityId && scope.staffedIdentityIds.has(mailboxIdentityId);
  if (scope.isPersonal) return !isStaffedThread;
  return mailboxIdentityId === scope.identityId;
}

/**
 * Seats the member on a thread of a mailbox they staff
 * (`mailboxSeatIdentityId`), and marks a thread of the active read-only
 * mailbox (`isMailboxReadOnly`). Returns the same object when nothing changes,
 * so memoized rows survive. Also decorates a thread fetched by id (a deep
 * link, `useConversationDetail`), whose mailbox may differ from the active
 * one: the seat follows the thread's own mailbox.
 */
export function withMailboxSeat<ThreadRow extends Conversation>(
  conversation: ThreadRow,
  scope: ConversationListScope,
): ThreadRow {
  const mailboxIdentityId = conversation.mailboxIdentityId;
  const seatIdentityId =
    mailboxIdentityId && scope.staffedIdentityIds.has(mailboxIdentityId)
      ? mailboxIdentityId
      : undefined;
  const isReadOnly =
    scope.isReadOnly && !!seatIdentityId && seatIdentityId === scope.identityId;
  const hasSeatChange = conversation.mailboxSeatIdentityId !== seatIdentityId;
  const hasReadOnlyChange = isReadOnly && !conversation.isMailboxReadOnly;
  if (!hasSeatChange && !hasReadOnlyChange) return conversation;
  return {
    ...conversation,
    mailboxSeatIdentityId: seatIdentityId,
    ...(isReadOnly ? { isMailboxReadOnly: true } : {}),
  };
}

/** The query-key segment for a list scope: the active identity id. */
export function scopeCacheKey(scope: ConversationListScope | null): string {
  return scope?.identityId ?? UNRESOLVED_SCOPE_KEY;
}

/**
 * Demo only: true when the thread's counterpart or its own mailbox is an
 * identity the member has blocked (`/identity-blocks`). Live rows never need
 * this: `mailbox-seats.ts` already drops a blocked identity's threads before
 * the server answers `GET /conversations`. Checked against both
 * `counterpartIdentityId` (the customer's own view of the blocked business)
 * and `mailboxIdentityId` (a staffed view of it) so the thread disappears
 * from every scoped mailbox list at once, matching the backend closing it
 * for both sides.
 */
export function isBlockedByIdentity(
  conversation: Pick<
    Conversation,
    "counterpartIdentityId" | "mailboxIdentityId"
  >,
  blockedIdentityIds: ReadonlySet<string>,
): boolean {
  const { counterpartIdentityId, mailboxIdentityId } = conversation;
  return (
    (!!counterpartIdentityId &&
      blockedIdentityIds.has(counterpartIdentityId)) ||
    (!!mailboxIdentityId && blockedIdentityIds.has(mailboxIdentityId))
  );
}

export interface ResolvedActiveMailbox {
  active: MailboxSummary | null;
  /** The URL asked for a mailbox the member does not have (any more). */
  isRequestedMissing: boolean;
}

/**
 * The mailbox `?as=` names, or the profile mailbox when it names none or one
 * the member lost. Nothing resolves while the list is still loading.
 */
export function resolveActiveMailbox(
  mailboxes: readonly MailboxSummary[] | undefined,
  requestedIdentityId: string | null,
): ResolvedActiveMailbox {
  if (!mailboxes) return { active: null, isRequestedMissing: false };
  const profileMailbox =
    mailboxes.find((mailbox) => mailbox.kind === "profile") ??
    mailboxes[0] ??
    null;
  if (!requestedIdentityId) {
    return { active: profileMailbox, isRequestedMissing: false };
  }
  const requested = mailboxes.find(
    (mailbox) => mailbox.identityId === requestedIdentityId,
  );
  if (requested) return { active: requested, isRequestedMissing: false };
  return { active: profileMailbox, isRequestedMissing: true };
}

/**
 * The server's refusal for a mailbox the member does not staff (403
 * `IDENTITY_NOT_STAFF`). Reads the body's `code` the same way
 * `useMessageDeliverCore` lifts it into `failureCode`; the message text is
 * being reworded, so it is never read.
 */
export function isNotStaffError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    !!error.data &&
    typeof error.data === "object" &&
    "code" in error.data &&
    (error.data as { code?: unknown }).code === "IDENTITY_NOT_STAFF"
  );
}
