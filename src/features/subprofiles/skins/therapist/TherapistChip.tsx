import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { RevealList, RevealPop } from "./TherapistReveal";
import styles from "./therapistShared.module.css";

export type TherapistChipTone = "plain" | "hi" | "sm";

const TONE_CLASS: Record<TherapistChipTone, string | undefined> = {
  plain: undefined,
  hi: styles.chipHi,
  sm: styles.chipSm,
};

interface TherapistChipProps {
  /** plain: neutral pill; hi: coral highlight; sm: small lived-experience chip. */
  tone?: TherapistChipTone;
  /** Leading check icon, as on the "who for" chips. */
  hasCheck?: boolean;
  children: ReactNode;
}

/** One chip. Inside a `TherapistChipRow` (or any `RevealList`) a chip added
 *  by an edit pops in and a removed one pops out, as the editor's chips do;
 *  key it with `occurrenceKeys`. Anywhere else it renders still. */
export function TherapistChip({
  tone = "plain",
  hasCheck = false,
  children,
}: TherapistChipProps) {
  const className = [styles.chip, TONE_CLASS[tone]].filter(Boolean).join(" ");
  return (
    <RevealPop className={className}>
      {hasCheck && <FiCheck className={styles.chipIcon} aria-hidden="true" />}
      {children}
    </RevealPop>
  );
}

interface TherapistChipRowProps {
  children: ReactNode;
  /** Extra class from the caller's own module (spacing tweaks). */
  className?: string;
}

/** Wrapping row of chips. Its children sit in a `RevealList`, so each chip
 *  must be a keyed direct child (an unkeyed trailing edit link is fine). */
export function TherapistChipRow({
  children,
  className,
}: TherapistChipRowProps) {
  const rowClassName = [styles.chipRow, className].filter(Boolean).join(" ");
  return (
    <div className={rowClassName}>
      <RevealList>{children}</RevealList>
    </div>
  );
}
