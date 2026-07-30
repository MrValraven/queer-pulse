import { useEffect, useState } from "react";

/**
 * Owns the nested-replies UI state that isn't the reply data itself: which
 * reply ids have their subtree collapsed, and which reply (if any) the
 * inline reply composer is currently targeting, plus its draft body. Lifted
 * out of ThreadPage for the same reason `useThreadModeration` was — keeping
 * the page component itself well under the line budget.
 *
 * `resetKey` mirrors ThreadPage's own reply-list reset effect: pass the same
 * value that identifies "a different thread's replies just loaded" (e.g.
 * `threadData?.replies`) and this hook clears its own state in step, so a
 * newly-loaded thread never inherits a stale collapse/reply-target from the
 * previous one.
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

  /** Closes the inline composer and clears its draft — used both on an
   *  explicit Cancel and after a successful post (nothing to keep either
   *  way). */
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
