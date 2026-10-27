import type { ReactNode } from "react";
import { Reveal } from "../../../../shared/components/ui/Reveal";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./AudienceStep.module.css";

/** The ordered list the walkthrough steps sit in. */
export function AudienceStepList({ children }: { children: ReactNode }) {
  return <ol className={styles.list}>{children}</ol>;
}

/**
 * One walkthrough step: a numbered sentence beside the real component that
 * does it. Fades up as it scrolls in. `isReversed` puts the visual first on
 * wide screens, so a run of steps zigzags.
 */
export function AudienceStep({
  stepNumber,
  title,
  body,
  visual,
  isReversed = false,
}: {
  stepNumber: number;
  title: string;
  body: ReactNode;
  visual: ReactNode;
  isReversed?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Reveal
      as="li"
      className={[styles.step, isReversed && styles.reversed]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.copy}>
        <span className={styles.number}>
          {t("audiences:step.label", { number: stepNumber })}
        </span>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.body}>{body}</div>
      </div>
      <div className={styles.visual}>{visual}</div>
    </Reveal>
  );
}
