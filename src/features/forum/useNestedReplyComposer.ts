import { useEffect, useState } from "react";

/**
 * Owns the nested-replies UI state that isn't the reply data itself: which
 * reply ids have their subtree collapsed, and which reply (if any) the
 * inline reply composer is currently targeting, plus its draft body. Lifted
 * out of ThreadPage for the same reason `useThreadModeration` was — keeping
 * the page component itself well under the line budget.
 *
 * `resetKey` must be a STABLE identifier for "which thread is open" — e.g.
 * `threadData?.slug`, NOT the replies array. Keying on the array reference
 * would reset the composer on every background refetch (react-query mints a
 * fresh array with the same content), wiping any in-progress inline draft.
 * Keyed on the slug, the state clears only when the user opens a genuinely
 * different thread, so a newly-loaded thread never inherits a stale
 * collapse/reply-target from the previous one.
 *
 * `inlineDraft` is the composer's LIVE text only. Its durable copy is the
 * autosaved draft `ThreadComposer` keeps per (thread, parent post) — clearing
 * the state here never discards that (PRD-166).
 *
 * PRD-165 asked whether that durable copy should follow the member across
 * devices the way the new-thread draft now does. It already does, and needs
 * nothing added: `ThreadComposer` autosaves through the same `/me/drafts` row
 * as every other composer, so the reply text is on the server either way. What
 * the new-thread composer had to promote was its EXTRA state (category,
 * community, tags, photo), and a reply box has none of that: it is a body and
 * nothing else. Inventing a bag for it would persist state that does not exist.
 * The one genuinely local thing here is `inlineDraft`, which is the controlled
 * value of an open textarea while it is on screen.
 */
export function useNestedReplyComposer(resetKey: unknown) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsedIds(new Set());
    setReplyTargetId(null);
    setInlineDraft("");
  }, [resetKey]);

  function toggleCollapse(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startReply(replyId: string) {
    setReplyTargetId(replyId);
    setInlineDraft("");
  }

  /** Closes the inline composer and clears the ON-SCREEN text — used both on
   *  an explicit Cancel and after a successful post.
   *
   *  It does NOT touch the PERSISTED draft, which is deliberate: the composer
   *  itself deletes that once the reply really posts (`ThreadComposer.post`),
   *  and a Cancel (or the mis-tap that closes one composer by opening another)
   *  must leave the member's words recoverable. Reopening the same reply box
   *  restores them. */
  function cancelReply() {
    setReplyTargetId(null);
    setInlineDraft("");
  }

  return {
    collapsedIds,
    toggleCollapse,
    replyTargetId,
    inlineDraft,
    setInlineDraft,
    startReply,
    cancelReply,
  };
}
