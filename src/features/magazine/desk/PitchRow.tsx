import { FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Pitch } from "../data/desk.data";
import styles from "./PitchInbox.module.css";

export interface PitchRowProps {
  pitch: Pitch;
  /** Whether this pitch is currently in the bulk-triage selection. */
  selected: boolean;
  /** True while this row is fading out after a triage decision. */
  leaving: boolean;
  onToggleSelect: (id: string) => void;
  /** Opens the commission flow prefilled from this pitch. */
  onCommission: (pitch: Pitch) => void;
  /** Marks the pitch "maybe" — a simple status flip, so only the id is needed. */
  onMaybe: (id: string) => void;
  /** Opens the pass flow (template + note) prefilled from this pitch. */
  onPass: (pitch: Pitch) => void;
}

/**
 * One row in the pitch inbox: a bulk-select checkbox, the pitch's title,
 * byline, note and tags, and its per-row Commission/Maybe/Pass actions.
 * Fades out via `data-leaving` once a decision has been made.
 */
export function PitchRow({
  pitch,
  selected,
  leaving,
  onToggleSelect,
  onCommission,
  onMaybe,
  onPass,
}: PitchRowProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.pitch} data-leaving={leaving}>
      <button
        type="button"
        className={styles.checkbox}
        aria-pressed={selected}
        aria-label={t("magazine:desk.pitchRow.selectAria", { title: pitch.title })}
        onClick={() => onToggleSelect(pitch.id)}
      >
        {selected ? <FiCheck size={12} /> : null}
      </button>
      <div className={styles.body}>
        <h4>{pitch.title}</h4>
        <span className={styles.byline}>
          {pitch.byline}
          {pitch.fresh ? t("magazine:desk.pitchRow.firstPitchSuffix") : ""}
        </span>
        <p className={styles.note}>{pitch.note}</p>
        <div className={styles.tags}>
          {pitch.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
          {pitch.suggest === "deck" ? (
            <span className={cx(styles.tag, styles.tagPlum)}>
              {t("magazine:desk.pitchRow.betterAsDeck")}
            </span>
          ) : null}
        </div>
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="primary" onClick={() => onCommission(pitch)}>
          {t("magazine:desk.pitchRow.commission")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onMaybe(pitch.id)}>
          {t("magazine:desk.pitchRow.maybe")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onPass(pitch)}>
          {t("magazine:desk.pitchRow.pass")}
        </Button>
      </div>
    </div>
  );
}
