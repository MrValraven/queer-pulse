import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CreatorDraftNotice.module.css";

type LoadNewerPhase = "idle" | "awaiting" | "failed";

/**
 * Tracks one Load the newer draft click: a busy spell that ends with the strip
 * still open means the newer draft did not load (a failed read, or a payload
 * the editor cannot restore). Closing the strip starts over.
 */
function useLoadNewerFailure(isOpen: boolean, isBusy: boolean) {
  const [phase, setPhase] = useState<LoadNewerPhase>("idle");
  const [wasBusy, setWasBusy] = useState(isBusy);
  let currentPhase = phase;
  if (wasBusy !== isBusy) {
    setWasBusy(isBusy);
    if (wasBusy && isOpen && currentPhase === "awaiting") {
      currentPhase = "failed";
      setPhase(currentPhase);
    }
  }
  if (!isOpen && currentPhase !== "idle") {
    currentPhase = "idle";
    setPhase(currentPhase);
  }
  return {
    hasLoadFailed: currentPhase === "failed",
    noteLoadStarted: () => setPhase("awaiting"),
    clearLoadFailure: () => setPhase("idle"),
  };
}

/** The editor's own save line (`CreatorDraftSaveLine`), matched by the class
 *  it shares with this strip, so no other status region is ever picked. */
const SAVE_LINE_SELECTOR = `[role="status"].${styles.saveLine}`;

/** The save line closest to the strip in the tree, or null when the editor
 *  shows none. Each ancestor up the tree is searched in turn, so a save line
 *  in the same form wins over one elsewhere on the page. */
function findNearestSaveLine(start: HTMLElement): HTMLElement | null {
  for (
    let ancestor = start.parentElement;
    ancestor !== null;
    ancestor = ancestor.parentElement
  ) {
    const saveLine = ancestor.querySelector<HTMLElement>(SAVE_LINE_SELECTOR);
    if (saveLine) return saveLine;
  }
  return null;
}

/**
 * Keeps focus on the page when the strip folds after Keep this version or a
 * Load that worked. The folding panel turns inert, which would drop focus on
 * the body, so focus moves first: to the editor's save line when there is
 * one, which then reads out the save, and otherwise to the strip's anchor,
 * which stays mounted where the strip was so Tab carries on from there.
 */
function useFocusHandoffOnFold(isOpen: boolean, hasLoadFailed: boolean) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const isHandoffPendingRef = useRef(false);
  const wasOpenRef = useRef(isOpen);

  // A Load that ended failed leaves the strip open, so its handoff is void.
  useLayoutEffect(() => {
    if (hasLoadFailed) isHandoffPendingRef.current = false;
  }, [hasLoadFailed]);

  useLayoutEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;
    const anchor = anchorRef.current;
    if (isOpen || !wasOpen || !anchor) return;
    const isHandoffPending = isHandoffPendingRef.current;
    isHandoffPendingRef.current = false;
    const activeElement = document.activeElement;
    const isFocusInStrip =
      activeElement !== null &&
      activeElement !== anchor &&
      anchor.contains(activeElement);
    const isFocusLost =
      activeElement === null || activeElement === document.body;
    if (!isFocusInStrip && !(isHandoffPending && isFocusLost)) return;
    const target = findNearestSaveLine(anchor) ?? anchor;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus();
  }, [isOpen]);

  return {
    anchorRef,
    noteHandoffPending: () => {
      isHandoffPendingRef.current = true;
    },
  };
}

/** The 409 choice: load the newer draft, or keep what is typed here. */
export function CreatorDraftConflictStrip({
  isOpen,
  isBusy,
  isServerDraftGone = false,
  onLoadNewer,
  onKeepThisVersion,
}: {
  isOpen: boolean;
  isBusy: boolean;
  /** True when the 409's revision is null: the server slot holds no live
   *  row, so only Keep this version shows. */
  isServerDraftGone?: boolean;
  onLoadNewer: () => void;
  onKeepThisVersion: () => void;
}) {
  const { t } = useTranslation();
  const { hasLoadFailed, noteLoadStarted, clearLoadFailure } =
    useLoadNewerFailure(isOpen, isBusy);
  const { anchorRef, noteHandoffPending } = useFocusHandoffOnFold(
    isOpen,
    hasLoadFailed,
  );
  const titleKey = isServerDraftGone
    ? "shared:creatorDraft.conflict.goneTitle"
    : "shared:creatorDraft.conflict.title";
  const bodyKey = isServerDraftGone
    ? "shared:creatorDraft.conflict.goneBody"
    : "shared:creatorDraft.conflict.body";
  const ariaDisabled = isBusy || undefined;

  return (
    <div ref={anchorRef} tabIndex={-1} className={styles.conflictAnchor}>
      <Collapse isOpen={isOpen}>
        <div role="alert" className={styles.conflict}>
          <p className={styles.conflictTitle}>{t(titleKey)}</p>
          <p className={styles.conflictBody}>{t(bodyKey)}</p>
          <div className={styles.actions}>
            <Collapse
              isOpen={!isServerDraftGone}
              className={styles.actionCollapse}
            >
              <Button
                size="sm"
                variant="primary"
                aria-disabled={ariaDisabled}
                onClick={() => {
                  if (isBusy) return;
                  // A retry folds the old line away, so a second failure reads as new.
                  noteLoadStarted();
                  noteHandoffPending();
                  onLoadNewer();
                }}
              >
                {t("shared:creatorDraft.conflict.loadNewer")}
              </Button>
            </Collapse>
            <Button
              size="sm"
              variant={isServerDraftGone ? "primary" : "ghost"}
              aria-disabled={ariaDisabled}
              onClick={() => {
                if (isBusy) return;
                clearLoadFailure();
                noteHandoffPending();
                onKeepThisVersion();
              }}
            >
              {t("shared:creatorDraft.conflict.keepThisVersion")}
            </Button>
          </div>
          <Collapse isOpen={hasLoadFailed && !isServerDraftGone}>
            <p className={styles.conflictFailure}>
              {t("shared:creatorDraft.conflict.loadFailed")}
            </p>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
