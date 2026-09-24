import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
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

export function TherapistChip({
  tone = "plain",
  hasCheck = false,
  children,
}: TherapistChipProps) {
  const className = [styles.chip, TONE_CLASS[tone]].filter(Boolean).join(" ");
  return (
    <span className={className}>
      {hasCheck && <FiCheck className={styles.chipIcon} aria-hidden="true" />}
      {children}
    </span>
  );
}

interface TherapistChipRowProps {
  children: ReactNode;
  /** Extra class from the caller's own module (spacing tweaks). */
  className?: string;
}

/** Wrapping row of chips. */
export function TherapistChipRow({
  children,
  className,
}: TherapistChipRowProps) {
  const rowClassName = [styles.chipRow, className].filter(Boolean).join(" ");
  return <div className={rowClassName}>{children}</div>;
}
