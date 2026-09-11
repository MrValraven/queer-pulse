import { useId, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiRotateCcw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { cx } from "../../shared/lib/cx";
import styles from "./CreateGatheringShell.module.css";

export interface ActionStripProps {
  /** The bold line, e.g. "Resume your draft?". */
  title: ReactNode;
  /** The muted line under it. */
  sub?: ReactNode;
  /**
   * `default`: a white strip with a coral icon (the draft resume offer).
   * `jade`: a jade-tinted strip set into a chapter ("Same as last time?").
   */
  tone?: "default" | "jade";
  /** Defaults to the rotate-back arrow both design strips use. */
  icon?: IconType;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

/** A one-line offer with two answers: icon, title and sub line, then a ghost
 *  and a primary button. Both answers usually remove the strip, so each
 *  caller moves focus somewhere stable once it is gone. */
export function ActionStrip({
  title,
  sub,
  tone = "default",
  icon: Icon = FiRotateCcw,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: ActionStripProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cx(styles.strip, tone === "jade" && styles.stripJade)}
    >
      <span className={styles.stripIcon} aria-hidden>
        <Icon />
      </span>
      <div className={styles.stripText}>
        <p id={titleId} className={styles.stripTitle}>
          {title}
        </p>
        {sub && <span className={styles.stripSub}>{sub}</span>}
      </div>
      <div className={styles.stripActions}>
        <Button variant="ghost" size="sm" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
        <Button variant="primary" size="sm" onClick={onPrimary}>
          {primaryLabel}
        </Button>
      </div>
    </section>
  );
}
