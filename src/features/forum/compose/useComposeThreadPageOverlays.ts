import { useCallback, useState } from "react";
import { useLocalStorage } from "../../../shared/hooks";
import type { PublishMode } from "./composeThread.types";
import type { SimilarThread } from "./useSimilarThreads";

// ── Which card is over the composer, and why ────────────────────────────────
// Six overlays share one page, and every one of them is modal, so only one can
// ever be up. Holding them as a single value rather than six booleans is what
// makes that structural instead of a rule somebody has to remember: there is
// no state in which two are open, and no order of calls that can produce one.
//
// The publish path is the reason this is a machine rather than a flag. Asking
// to publish can mean "publish", "ask me when first" or "show me what I am
// about to post first", and the answer depends on the mode and on whether this
// is the member's first post. `requestPublish` is the ONE entry point, so the
// footer, the publish menu and ⌘↵ cannot disagree about what happens next.

/** Which overlay is up, or null for the bare composer. */
export type ComposeOverlay =
  "confirmClose" | "shortcuts" | "schedule" | "review" | "replyInstead";

/** Remembers "don't show me the summary again" across visits. Device-local on
 *  purpose: it is a preference about this member's own reading, not a fact
 *  about their account worth a round trip. */
const SKIP_REVIEW_STORAGE_KEY = "qp.forum.compose.skipFirstPostReview";

export interface ComposeThreadPageOverlaysOptions {
  /** True while this member has never posted. The summary card is an
   *  orientation for a first post, not a checkout step for every post. */
  isFirstPost: boolean;
  /** True while there is something in the composer worth confirming before
   *  leaving. An empty composer just leaves. */
  hasUnsavedDraft: boolean;
  /** Runs the publish for real. Called only once every question has an
   *  answer. */
  onPublish: (mode: PublishMode, scheduledAtLocal: string | null) => void;
  /** Leave the composer. */
  onLeave: () => void;
}

export function useComposeThreadPageOverlays({
  isFirstPost,
  hasUnsavedDraft,
  onPublish,
  onLeave,
}: ComposeThreadPageOverlaysOptions) {
  const [overlay, setOverlay] = useState<ComposeOverlay | null>(null);
  const [pendingMode, setPendingMode] = useState<PublishMode>("now");
  const [scheduledAtLocal, setScheduledAtLocal] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<SimilarThread | null>(null);
  const [shouldSkipReview, setShouldSkipReview] = useLocalStorage(
    SKIP_REVIEW_STORAGE_KEY,
    false,
  );

  const closeOverlay = useCallback(() => {
    setOverlay(null);
    setReplyTarget(null);
  }, []);

  /** Publish, or ask the one question still outstanding. */
  const publishOrAsk = useCallback(
    (mode: PublishMode, whenLocal: string | null) => {
      // A schedule with no moment is the moment being asked for.
      if (mode === "schedule" && !whenLocal) {
        setPendingMode(mode);
        setOverlay("schedule");
        return;
      }
      if (isFirstPost && !shouldSkipReview) {
        setPendingMode(mode);
        setOverlay("review");
        return;
      }
      setOverlay(null);
      onPublish(mode, whenLocal);
    },
    [isFirstPost, shouldSkipReview, onPublish],
  );

  const requestPublish = useCallback(
    (mode: PublishMode) => publishOrAsk(mode, scheduledAtLocal),
    [publishOrAsk, scheduledAtLocal],
  );

  const confirmSchedule = useCallback(
    (whenLocal: string) => {
      setScheduledAtLocal(whenLocal);
      publishOrAsk("schedule", whenLocal);
    },
    [publishOrAsk],
  );

  const confirmReview = useCallback(() => {
    setOverlay(null);
    onPublish(pendingMode, scheduledAtLocal);
  }, [onPublish, pendingMode, scheduledAtLocal]);

  const requestCancel = useCallback(() => {
    if (!hasUnsavedDraft) {
      onLeave();
      return;
    }
    setOverlay("confirmClose");
  }, [hasUnsavedDraft, onLeave]);

  const requestReplyInstead = useCallback((thread: SimilarThread) => {
    setReplyTarget(thread);
    setOverlay("replyInstead");
  }, []);

  const openShortcuts = useCallback(() => setOverlay("shortcuts"), []);

  return {
    overlay,
    /** The mode the review card is standing in for. */
    pendingMode,
    scheduledAtLocal,
    replyTarget,
    shouldSkipReview,
    setShouldSkipReview,
    closeOverlay,
    openShortcuts,
    requestPublish,
    confirmSchedule,
    confirmReview,
    requestCancel,
    requestReplyInstead,
  };
}

export type ComposeThreadPageOverlays = ReturnType<
  typeof useComposeThreadPageOverlays
>;
