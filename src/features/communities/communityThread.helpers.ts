// Pure helpers for `useCommunityThreadState` and its sub-hooks: shaping the
// merged reply list, deriving the OP post's effective flags, and the
// own-content checks shared between the OP post and its replies. No React
// state here, so these are trivially testable and don't count against the
// per-function line limit that applies to hooks/components.
import type { AuthUser } from "../auth/api/auth.api";
import type { Reply, Thread as ThreadData } from "./communityDetails";

// Synthetic ids for optimistic replies (both demo and live), so the reply's
// actions menu (keyed by id via replyOverrides / DTO flags) can ever apply
// to it instead of silently no-op'ing.
let optimisticReplyIdCounter = 0;
export function nextOptimisticReplyId(): string {
  optimisticReplyIdCounter += 1;
  return crypto.randomUUID?.() ?? `local-${optimisticReplyIdCounter}`;
}

/** Demo-only local overrides for the OP post (live refetches after each
 *  mutation instead). Owned by `useThreadOpModerationState`. */
export interface OpOverride {
  post?: string;
  deleted?: boolean;
  editedAt?: string | null;
  pinned?: boolean;
}

/** OP effective values + flags. Live: DTO flags on `data`. Demo: the "You"
 *  persona (the discussion widget authors new threads as { name: "You" }). */
export function deriveOpFlags({
  data,
  demoMode,
  user,
  opOverride,
  canModerate,
  isMember,
}: {
  data: ThreadData;
  demoMode: boolean;
  user: AuthUser | null;
  opOverride: OpOverride;
  canModerate: boolean;
  isMember: boolean;
}) {
  const opOwned = demoMode && data.author.name === "You";
  // Live "is this my post" check — no DTO flag says so directly (`canEdit` is
  // also true for a mod editing someone else's post), so compare the viewer's
  // own slug to the author's. Drives hiding "Report" on your own post.
  const opIsMine = demoMode
    ? opOwned
    : !!user?.profile.slug && user.profile.slug === data.author.slug;
  const opDeleted = demoMode ? !!opOverride.deleted : !!data.deleted;
  const opPinned = demoMode
    ? (opOverride.pinned ?? !!data.pinned)
    : !!data.pinned;
  const opBody = demoMode ? (opOverride.post ?? data.post) : data.post;
  const opEditedAt = demoMode
    ? (opOverride.editedAt ?? data.editedAt ?? null)
    : (data.editedAt ?? null);
  const opCanEdit = demoMode ? opOwned && !opDeleted : !!data.canEdit;
  const opCanDelete = demoMode ? opOwned && !opDeleted : !!data.canDelete;
  const opCanRestore = demoMode ? opOwned && opDeleted : !!data.canRestore;
  const opCanViewHistory = demoMode ? false : !!data.canViewHistory;
  // Pin/unpin is owner/mod-only, regardless of who authored the post.
  const opCanPin = canModerate && !opDeleted;
  // Report is offered to any member on content that isn't their own.
  const opCanReport = isMember && !opIsMine && !opDeleted;

  return {
    opDeleted,
    opPinned,
    opBody,
    opEditedAt,
    opCanEdit,
    opCanDelete,
    opCanRestore,
    opCanViewHistory,
    opCanPin,
    opCanReport,
  };
}

/** Server rows first, the viewer's own just-posted replies last, deduped by
 *  id keeping the first occurrence: a reply the author keeps locally (see
 *  `useThreadComposerState`) disappears from `extraReplies` the moment the
 *  refetched server list carries the same id, so it never renders twice. */
export function buildRepliesList({
  data,
  loadedMoreReplies,
  extraReplies,
  replyOverrides,
}: {
  data: ThreadData;
  loadedMoreReplies: Reply[];
  extraReplies: Reply[];
  replyOverrides: Record<string, Partial<Reply>>;
}): Reply[] {
  const seenReplyIds = new Set<string>();
  return [...data.replies, ...loadedMoreReplies, ...extraReplies]
    .filter((item) => {
      if (!item.id) return true;
      if (seenReplyIds.has(item.id)) return false;
      seenReplyIds.add(item.id);
      return true;
    })
    .map((item) =>
      item.id && replyOverrides[item.id]
        ? { ...item, ...replyOverrides[item.id] }
        : item,
    );
}

/** A reply belongs to the viewer when its author slug matches the session
 *  (live) or it's the demo "You" persona — the same own-content check as
 *  `deriveOpFlags`'s `opIsMine`, applied per-reply since replies don't share
 *  the OP's flags. */
export function isReplyMine(
  reply: Reply,
  demoMode: boolean,
  user: AuthUser | null,
): boolean {
  return demoMode
    ? reply.name === "You"
    : !!user?.profile.slug && user.profile.slug === reply.authorSlug;
}

/** Report is offered to any member on a reply that isn't their own and isn't
 *  already deleted — the reply-level equivalent of `deriveOpFlags`'s
 *  `opCanReport`. */
export function canReportReplyContent(
  reply: Reply,
  {
    isMember,
    demoMode,
    user,
  }: { isMember: boolean; demoMode: boolean; user: AuthUser | null },
): boolean {
  return isMember && !isReplyMine(reply, demoMode, user) && !reply.deleted;
}
