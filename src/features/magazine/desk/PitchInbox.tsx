import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PitchRow } from "./PitchRow";
import type { Pitch } from "../data/desk.data";
import styles from "./PitchInbox.module.css";

export interface PitchInboxProps {
  pitches: Pitch[];
  /** Ids of pitches currently selected for bulk triage. */
  selected: string[];
  onToggleSelect: (id: string) => void;
  /** Opens the commission flow prefilled from the given pitch. */
  onCommission: (pitch: Pitch) => void;
  /** Marks a pitch "maybe" — a simple status flip, so only the id is needed. */
  onMaybe: (id: string) => void;
  /** Opens the pass flow (template + note) prefilled from the given pitch. */
  onPass: (pitch: Pitch) => void;
  /** Ids currently fading out after a triage decision, for the exit animation. */
  leaving: string[];
}

/**
 * The magazine desk's pitch inbox: one row per pending pitch, each with a
 * bulk-select checkbox and per-pitch Commission/Maybe/Pass actions. Renders
 * an honest empty state once every pitch for the issue has been answered.
 */
export function PitchInbox({
  pitches,
  selected,
  onToggleSelect,
  onCommission,
  onMaybe,
  onPass,
  leaving,
}: PitchInboxProps) {
  const { t } = useTranslation();

  if (pitches.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          <h3>{t("magazine:desk.pitchInbox.emptyTitle")}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {pitches.map((pitch) => (
        <PitchRow
          key={pitch.id}
          pitch={pitch}
          selected={selected.includes(pitch.id)}
          leaving={leaving.includes(pitch.id)}
          onToggleSelect={onToggleSelect}
          onCommission={onCommission}
          onMaybe={onMaybe}
          onPass={onPass}
        />
      ))}
    </div>
  );
}
