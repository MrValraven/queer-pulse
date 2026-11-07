import {
  useEffect,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import styles from "./PiecesPipeline.module.css";

/** Longest the fold may take before the rows are dropped regardless: a
 *  background tab or a hidden table never fires `transitionend`. */
const FOLD_SAFETY_MS = 600;

export interface PieceGroupBodyProps {
  /** Id the group header's `aria-controls` points at. */
  id: string;
  isOpen: boolean;
  /** The group's rows. Mounted while open and while folding away. */
  children: ReactNode;
}

/**
 * The rows of one pipeline group, folding with a height and fade. The height
 * animates through `grid-template-rows` (0fr to 1fr) in pure CSS, because the
 * rows are subgrids of the table and a wrapper with its own height (motion's
 * `Collapse`) would break the shared columns. The region stays in the DOM
 * when folded so `aria-controls` resolves; the rows inside unmount once the
 * fold has finished, so a folded group costs nothing. A group that mounts
 * folded (page load) never animates, and while folding the region is `inert`
 * so no control in it can be tabbed to or clicked.
 */
export function PieceGroupBody({ id, isOpen, children }: PieceGroupBodyProps) {
  const [hasFinishedFolding, setHasFinishedFolding] = useState(!isOpen);
  if (isOpen && hasFinishedFolding) setHasFinishedFolding(false);
  const isFolding = !isOpen && !hasFinishedFolding;

  useEffect(() => {
    if (!isFolding) return undefined;
    const timeoutId = window.setTimeout(
      () => setHasFinishedFolding(true),
      FOLD_SAFETY_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isFolding]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      isFolding &&
      event.target === event.currentTarget &&
      event.propertyName === "grid-template-rows"
    ) {
      setHasFinishedFolding(true);
    }
  };

  return (
    <div
      id={id}
      className={[styles.groupBodyRegion, isOpen && styles.groupBodyRegionOpen]
        .filter(Boolean)
        .join(" ")}
      inert={!isOpen}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={styles.groupBody}>
        {(isOpen || isFolding) && children}
      </div>
    </div>
  );
}
