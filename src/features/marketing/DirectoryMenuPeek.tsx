import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DirectoryMenuPeek.module.css";

/** How much of the menu shows while it is folded. */
const PEEK_HEIGHT_PX = 220;
/** A menu this close to the peek height shows whole: a toggle that reveals a
 *  few more lines is not worth the click. */
const PEEK_SLACK_PX = 40;
const OPEN_SECONDS = 0.28;
const EASE = [0.22, 0.68, 0.16, 1] as const;

interface DirectoryMenuPeekProps {
  isOpen: boolean;
  onToggle: () => void;
  /** Whether the content is tall enough to need folding. Reported once it is
   *  measured, and again whenever the content resizes. */
  onFoldableChange: (isFoldable: boolean) => void;
  isFoldable: boolean;
  /** Fires when the open animation has finished, for a caller that waits for
   *  the full height before it scrolls. */
  onOpenComplete: () => void;
  regionId: string;
  children: ReactNode;
}

/**
 * Folds its children to a peek with a toggle below, animating the height and
 * the bottom fade together. Content that is barely taller than the peek
 * renders whole, with no toggle.
 */
export function DirectoryMenuPeek({
  isOpen,
  onToggle,
  onFoldableChange,
  isFoldable,
  onOpenComplete,
  regionId,
  children,
}: DirectoryMenuPeekProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const innerRef = useRef<HTMLDivElement>(null);
  const [isMeasured, setIsMeasured] = useState(false);
  const duration = reducedMotion ? 0 : OPEN_SECONDS;

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner || typeof ResizeObserver === "undefined") {
      setIsMeasured(true);
      return;
    }
    const measure = () => {
      onFoldableChange(
        inner.getBoundingClientRect().height > PEEK_HEIGHT_PX + PEEK_SLACK_PX,
      );
      setIsMeasured(true);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [onFoldableChange]);

  const isFolded = isFoldable && !isOpen;
  return (
    <>
      <m.div
        id={regionId}
        className={`${styles.peek} ${isFolded ? styles.peekCollapsed : ""}`}
        style={{
          ["--menu-peek-duration" as string]: `${duration}s`,
          // Hidden until measured, so a short menu never flashes folded.
          visibility: isMeasured ? undefined : "hidden",
        }}
        initial={false}
        animate={{
          height: isFolded ? PEEK_HEIGHT_PX : "auto",
          // Overflow opens on its own zero-length step at the end of the
          // height, so focus rings are not clipped once the menu is open.
          overflow: isFolded ? "hidden" : "visible",
        }}
        transition={{
          duration,
          ease: EASE,
          overflow: { duration: 0, delay: isFolded ? 0 : duration },
        }}
        onAnimationComplete={() => {
          if (isOpen) onOpenComplete();
        }}
      >
        <div ref={innerRef} className={styles.inner}>
          {children}
        </div>
      </m.div>
      {isFoldable && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-controls={regionId}
          onClick={onToggle}
        >
          {t(
            isOpen
              ? "marketing:directory.detail.menu.close"
              : "marketing:directory.detail.menu.open",
          )}
        </Button>
      )}
    </>
  );
}
