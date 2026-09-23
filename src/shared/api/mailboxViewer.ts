import type { QueryClient } from "@tanstack/react-query";
import type { AuthorSummary, IdentityKind } from "../contracts/contracts";

/** One mailbox the member may read and answer (`GET /identities/mailboxes`,
 *  backend `MailboxSummaryDto`). Hand-mirrored: the two repos share no types. */
export interface MailboxSummary {
  identityId: string;
  kind: IdentityKind;
  /** Null when the owning row vanished mid-request; render
   *  `messages:mailbox.untitled`. */
  displayName: string | null;
  handle: string | null;
  avatarUrl: string | null;
  /** Unread THREADS in this mailbox, by the nav badge's rules. */
  unreadCount: number;
  isOwner: boolean;
  /** A persona moderation removed: readable, and nothing can be sent as it. */
  isReadOnly: boolean;
  /** The owner's staff-naming switch. Null on the profile mailbox. */
  shouldShowStaffNames: boolean | null;
  /** The member's own naming preference here, true until they change it.
   *  Null on the profile mailbox. */
  shouldAllowMyName: boolean | null;
}

/**
 * Deliberately under the nav badge's `["conversations-unread-count"]` prefix:
 * every place that already invalidates the badge after a read, a send, a
 * socket frame or a block also refreshes the per-mailbox counts, with no new
 * call site. Safe because nothing writes that prefix with `setQueryData`;
 * the badge itself sits at `["conversations-unread-count", demoMode, token]`,
 * whose second element is a boolean, so this prefix never matches it.
 */
export const MAILBOXES_QUERY_KEY_PREFIX = [
  "conversations-unread-count",
  "mailboxes",
] as const;

export function mailboxesQueryKey(demoMode: boolean) {
  return [...MAILBOXES_QUERY_KEY_PREFIX, demoMode] as const;
}

/** Who is reading: the member's own handle plus every listing, persona and
 *  company identity they currently answer for. */
export interface MessageViewer {
  myHandle: string | null;
  staffedIdentityIds: ReadonlySet<string>;
}

export function staffedIdentityIdsOf(
  mailboxes: readonly MailboxSummary[] | undefined,
): ReadonlySet<string> {
  return new Set(
    (mailboxes ?? [])
      .filter((mailbox) => mailbox.kind !== "profile")
      .map((mailbox) => mailbox.identityId),
  );
}

/**
 * The one "is this ours" test for a message sender (spec 6.3). A message sent
 * as an identity the viewer staffs sits on the viewer's side whoever typed it,
 * so a colleague's reply is never unread and never answered twice. Otherwise
 * the old handle comparison holds, since a personal sender carries no
 * identity id and handles share one namespace with identities.
 *
 * The spec phrases this as a comparison with the ACTIVE identity. A thread
 * belongs to exactly one mailbox and a member cannot be the customer of a
 * mailbox they answer for (`IDENTITY_IS_YOUR_OWN`), so "an identity I staff"
 * and "this thread's seat identity" agree on every thread the viewer can read;
 * the set form also works where no thread is open (realtime frames, search).
 *
 * A missing sender reads as the other side. The socket frame contract is
 * hand-written, and a malformed live frame must never throw inside a socket
 * handler.
 */
export function isFromViewerSide(
  sender: Pick<AuthorSummary, "handle" | "identityId"> | null | undefined,
  viewer: MessageViewer,
): boolean {
  const identityId = sender?.identityId;
  if (identityId && viewer.staffedIdentityIds.has(identityId)) return true;
  return !!viewer.myHandle && sender?.handle === viewer.myHandle;
}

/** Staffed identity ids from whatever mailbox lists are cached, for code that
 *  runs outside React (the realtime client). Empty before the first load,
 *  which only means a colleague's reply may briefly count as unread locally
 *  until the server's own counts arrive. */
export function readStaffedIdentityIds(
  queryClient: QueryClient,
): ReadonlySet<string> {
  const identityIds = new Set<string>();
  for (const [, mailboxes] of queryClient.getQueriesData<MailboxSummary[]>({
    queryKey: MAILBOXES_QUERY_KEY_PREFIX,
  })) {
    for (const identityId of staffedIdentityIdsOf(mailboxes)) {
      identityIds.add(identityId);
    }
  }
  return identityIds;
}
