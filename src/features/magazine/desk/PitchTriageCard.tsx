import type { RefObject } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button, IconButton } from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Pitch } from "../data/desk.data";
import { TRIAGE_SHORTCUT_KEYS } from "./usePitchTriageKeys";
import styles from "./PitchTriage.module.css";

export interface PitchTriageCardProps {
  pitch: Pitch;
  /** Receives focus on open and after every move, so the title is announced. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** True while the pitch fades out after a decision. */
  isLeaving: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCommission: (pitch: Pitch) => void;
  onMaybe: (pitch: Pitch) => void;
  onPass: (pitch: Pitch) => void;
  /** How long the writer has waited, when the view model knows it. */
  pitchAgeLabel?: (pitch: Pitch) => string | null;
}

/**
 * One pitch at full attention: the title large in the serif, who sent it, the
 * note and tags, then the three answers. Commission carries the only emphasis
 * in the overlay, since it is the answer that turns a pitch into a piece;
 * Maybe and Pass show the keys that trigger them.
 */
export function PitchTriageCard({
  pitch,
  headingRef,
  isLeaving,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onCommission,
  onMaybe,
  onPass,
  pitchAgeLabel,
}: PitchTriageCardProps) {
  const { t } = useTranslation();
  const ageLabel = pitchAgeLabel?.(pitch) ?? null;
  const hasTags = pitch.tags.length > 0 || pitch.suggest === "deck";

  return (
    <>
      <article
        key={pitch.id}
        className={styles.card}
        data-leaving={isLeaving}
        aria-busy={isLeaving}
      >
        <p className={styles.meta}>
          <span className={styles.writer}>{pitch.byline}</span>
          {pitch.fresh ? (
            <span className={styles.newVoice}>
              {t("magazine:desk.triage.newVoice")}
            </span>
          ) : null}
          {ageLabel ? <span className={styles.age}>{ageLabel}</span> : null}
        </p>
        <h4 ref={headingRef} tabIndex={-1} className={styles.title}>
          {pitch.title}
        </h4>
        <p className={styles.note}>{pitch.note}</p>
        {hasTags ? (
          <ul
            className={styles.tags}
            aria-label={t("magazine:desk.triage.tagsLabel")}
          >
            {pitch.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
            {pitch.suggest === "deck" ? (
              <li className={cx(styles.tag, styles.tagDeck)}>
                {t("magazine:desk.triage.suggestedDeck")}
              </li>
            ) : null}
          </ul>
        ) : null}
      </article>

      <div className={styles.actionRow}>
        <div className={styles.decisions}>
          <Button
            variant="ghost"
            className={styles.commission}
            onClick={() => onCommission(pitch)}
          >
            {t("magazine:desk.triage.commission")}
          </Button>
          <Button
            variant="ghost"
            aria-keyshortcuts={TRIAGE_SHORTCUT_KEYS.maybe}
            onClick={() => onMaybe(pitch)}
          >
            {t("magazine:desk.triage.maybe")}
            <kbd className={styles.keyHint} aria-hidden>
              {TRIAGE_SHORTCUT_KEYS.maybe.toUpperCase()}
            </kbd>
          </Button>
          <Button
            variant="ghost"
            aria-keyshortcuts={TRIAGE_SHORTCUT_KEYS.pass}
            onClick={() => onPass(pitch)}
          >
            {t("magazine:desk.triage.pass")}
            <kbd className={styles.keyHint} aria-hidden>
              {TRIAGE_SHORTCUT_KEYS.pass.toUpperCase()}
            </kbd>
          </Button>
        </div>
        <div className={styles.stepper}>
          <IconButton
            aria-label={t("magazine:desk.triage.previous")}
            aria-keyshortcuts="ArrowLeft"
            disabled={!hasPrevious}
            onClick={onPrevious}
          >
            <FiChevronLeft aria-hidden />
          </IconButton>
          <IconButton
            aria-label={t("magazine:desk.triage.next")}
            aria-keyshortcuts="ArrowRight"
            disabled={!hasNext}
            onClick={onNext}
          >
            <FiChevronRight aria-hidden />
          </IconButton>
        </div>
      </div>
    </>
  );
}
