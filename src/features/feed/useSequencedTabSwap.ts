import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import type { FeedTab } from "./feed.data";

/** Exit-fade window in ms. Kept in sync with the `--dur-fast` (150ms) token
 *  that `.leaving` uses in FeedPage.module.css — change one, change the other. */
const EXIT_MS = 150;

export interface SequencedTabSwap {
  /** The tab the user last selected — drives the tab-bar highlight (instant). */
  targetTab: FeedTab;
  /** The tab whose content is currently rendered — lags `targetTab` mid-swap. */
  displayTab: FeedTab;
  /** True during the exit window: apply the `.leaving` fade to the content. */
  leaving: boolean;
  /** Select a tab, kicking off the sequenced exit → enter (instant under
   *  reduced motion). No-op when the tab is already selected. */
  selectTab: (next: FeedTab) => void;
  /** Wraps the content; its height is eased between the old and new sizes. */
  viewportRef: React.RefObject<HTMLDivElement | null>;
  /** The keyed content list; measured to drive the height ease. */
  contentRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Sequences the Feed's tab-content swap so leaving content fades out before the
 * incoming content fades in, and the container height eases between the two
 * sizes instead of snapping. Under reduced motion the swap is instant.
 */
export function useSequencedTabSwap(initialTab: FeedTab): SequencedTabSwap {
  const reduceMotion = usePrefersReducedMotion();
  const [targetTab, setTargetTab] = useState(initialTab);
  const [displayTab, setDisplayTab] = useState(initialTab);
  const [leaving, setLeaving] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectTab = useCallback(
    (next: FeedTab) => {
      if (next === targetTab) return;
      setTargetTab(next);

      // Reduced motion: swap immediately — no fade, no height ease.
      if (reduceMotion) {
        setDisplayTab(next);
        return;
      }

      // Freeze the viewport at the current content height so the swap can't
      // collapse the layout before the height ease runs.
      const viewport = viewportRef.current;
      const content = contentRef.current;
      if (viewport && content) {
        viewport.style.height = `${content.offsetHeight}px`;
      }

      setLeaving(true);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => {
        setDisplayTab(next);
        setLeaving(false);
      }, EXIT_MS);
    },
    [targetTab, reduceMotion],
  );

  // After the new content mounts, ease the frozen viewport height to the new
  // content height, then release to `auto` so later reflows stay natural.
  useLayoutEffect(() => {
    if (reduceMotion) return;
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    // Only runs mid-swap: `selectTab` froze the height to a px value. On the
    // first render (height is "") there is nothing to ease.
    if (!viewport.style.height || viewport.style.height === "auto") return;

    const target = content.offsetHeight;
    const frozen = Number.parseFloat(viewport.style.height);
    // No delta (two equally tall tabs): skip the transition, which would
    // otherwise never fire `transitionend` and strand the fixed height.
    if (Number.isNaN(frozen) || Math.abs(frozen - target) < 1) {
      viewport.style.height = "auto";
      return;
    }

    viewport.style.height = `${target}px`;
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "height") return;
      viewport.style.height = "auto";
      viewport.removeEventListener("transitionend", handleTransitionEnd);
    };
    viewport.addEventListener("transitionend", handleTransitionEnd);
    return () =>
      viewport.removeEventListener("transitionend", handleTransitionEnd);
  }, [displayTab, reduceMotion]);

  // Clear a pending exit timer if the page unmounts mid-swap.
  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

  return {
    targetTab,
    displayTab,
    leaving,
    selectTab,
    viewportRef,
    contentRef,
  };
}
