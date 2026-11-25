import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { SkeletonLine } from "../../../shared/components/ui";
import styles from "./QuizshowImport.module.css";

const FADE_EASE = [0.22, 0.68, 0.16, 1] as const;
const SKELETON_ROW_KEYS = ["first", "second", "third", "fourth"] as const;

/** Swaps a picker's loading, error and list bodies with an opacity fade. */
export function QuizshowPickerFade({
  stateKey,
  children,
}: {
  stateKey: string;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const transition = { duration: reducedMotion ? 0 : 0.2, ease: FADE_EASE };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={stateKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

/** Placeholder rows for a picker's list, or cover-shaped cards for the template gallery. */
export function QuizshowPickerSkeleton({
  layout = "list",
}: {
  layout?: "list" | "gallery";
}) {
  if (layout === "gallery") {
    return (
      <div aria-hidden className={styles.gallery}>
        {SKELETON_ROW_KEYS.map((cardKey) => (
          <SkeletonLine
            key={cardKey}
            height="auto"
            style={{ aspectRatio: "4 / 3", borderRadius: "var(--radius-20)" }}
          />
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={styles.skeletonRow}>
          <SkeletonLine
            height={72}
            style={{ borderRadius: "var(--radius-16)" }}
          />
        </div>
      ))}
    </div>
  );
}
