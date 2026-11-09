import type { ReactNode } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import type {
  QuizshowContentLabel,
  QuizshowPlayableRoundKind,
  QuizshowWheelBonus,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowWheelSliceTone } from "../quizshowWheel";
import styles from "./QuizshowWheelChips.module.css";
import { wheelSliceKindKey } from "./quizshowWheelCopy";

const TONE_CLASSES: Record<QuizshowWheelSliceTone, string | undefined> = {
  plum: styles.plum,
  rose: styles.rose,
  bonus: styles.bonus,
  bonusAlt: styles.bonusAlt,
};

/** A small square in a slice's swatch colour, sized by the surrounding font size. */
export function QuizshowWheelSwatch({
  tone,
}: {
  tone: QuizshowWheelSliceTone;
}): ReactNode {
  return (
    <span
      className={[styles.swatch, TONE_CLASSES[tone]].filter(Boolean).join(" ")}
      data-tone={tone}
      aria-hidden="true"
    />
  );
}

/** The gradient pill "+500" (bonus gradient, --qs-wheel-bonus-ink). */
export function QuizshowWheelBonusChip({
  points,
  labelKey = "quizshow:stage.wheel.bonusPoints",
}: {
  points: QuizshowWheelBonus;
  labelKey?: string;
}): ReactNode {
  const { t } = useTranslation();
  return <span className={styles.bonusChip}>{t(labelKey, { points })}</span>;
}

/** Spicy, sensitive or adults; renders nothing for "none". FiAlertTriangle as on the round card. */
export function QuizshowWheelContentChip({
  contentLabel,
}: {
  contentLabel: QuizshowContentLabel;
}): ReactNode {
  const { t } = useTranslation();
  if (contentLabel === "none") return null;
  return (
    <span className={styles.contentChip}>
      <FiAlertTriangle aria-hidden="true" fill="none" />
      {t(`quizshow:contentLabel.${contentLabel}`)}
    </span>
  );
}

/** "Quiz" or "Party", uppercase, muted. */
export function QuizshowWheelKindLabel({
  kind,
}: {
  kind: QuizshowPlayableRoundKind;
}): ReactNode {
  const { t } = useTranslation();
  return <span className={styles.kindLabel}>{t(wheelSliceKindKey(kind))}</span>;
}
