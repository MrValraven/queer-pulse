import { useEffect, useId, useRef } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Pitch } from "../data/desk.data";
import styles from "./PitchTriage.module.css";

export interface PitchTriageListProps {
  pitches: Pitch[];
  leavingPitchIds: string[];
  selectedPitchIds: string[];
  onToggleSelect: (pitchId: string) => void;
  onCommission: (pitch: Pitch) => void;
  onMaybe: (pitch: Pitch) => void;
  onPass: (pitch: Pitch) => void;
  pitchAgeLabel?: (pitch: Pitch) => string | null;
}

/**
 * Every waiting pitch as a checklist, for the editor who already knows the
 * answers and wants to give several at once. Each row keeps its own three
 * answers; the ticked ones are answered together from the overlay's footer.
 */
export function PitchTriageList({
  pitches,
  leavingPitchIds,
  selectedPitchIds,
  onToggleSelect,
  onCommission,
  onMaybe,
  onPass,
  pitchAgeLabel,
}: PitchTriageListProps) {
  const { t } = useTranslation();
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  // An answered row leaves with the button that answered it, and focus falls
  // to the page body behind the dialog. Focus goes to the checkbox of the row
  // that slid up into its place (the new last row when the last one left), so
  // a keyboard user keeps their place in a long list.
  const pitchIdsKey = pitches.map((pitch) => pitch.id).join(" ");
  const previousPitchIdsRef = useRef<string[]>([]);
  useEffect(() => {
    const currentPitchIds = pitchIdsKey.split(" ").filter(Boolean);
    const previousPitchIds = previousPitchIdsRef.current;
    previousPitchIdsRef.current = currentPitchIds;
    const list = listRef.current;
    if (!list || document.activeElement !== document.body) return;
    const leftIndex = previousPitchIds.findIndex(
      (pitchId) => !currentPitchIds.includes(pitchId),
    );
    const checkboxes = list.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    const targetIndex = Math.min(Math.max(leftIndex, 0), checkboxes.length - 1);
    (checkboxes[targetIndex] ?? list).focus();
  }, [pitchIdsKey]);

  return (
    <ul
      ref={listRef}
      tabIndex={-1}
      className={styles.list}
      aria-label={t("magazine:desk.triage.listLabel")}
    >
      {pitches.map((pitch) => {
        const checkboxId = `${listId}-${pitch.id}`;
        const titleId = `${checkboxId}-title`;
        const ageLabel = pitchAgeLabel?.(pitch) ?? null;
        return (
          <li
            key={pitch.id}
            className={styles.listRow}
            data-leaving={leavingPitchIds.includes(pitch.id)}
          >
            <input
              id={checkboxId}
              type="checkbox"
              className={styles.check}
              checked={selectedPitchIds.includes(pitch.id)}
              onChange={() => onToggleSelect(pitch.id)}
            />
            <div className={styles.listBody}>
              <label
                id={titleId}
                htmlFor={checkboxId}
                className={styles.listTitle}
              >
                {pitch.title}
              </label>
              <p className={styles.meta}>
                <span className={styles.writer}>{pitch.byline}</span>
                {pitch.fresh ? (
                  <span className={styles.newVoice}>
                    {t("magazine:desk.triage.newVoice")}
                  </span>
                ) : null}
                {ageLabel ? (
                  <span className={styles.age}>{ageLabel}</span>
                ) : null}
              </p>
            </div>
            <div className={styles.listActions}>
              <Button
                size="sm"
                variant="ghost"
                aria-describedby={titleId}
                onClick={() => onCommission(pitch)}
              >
                {t("magazine:desk.triage.commission")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-describedby={titleId}
                onClick={() => onMaybe(pitch)}
              >
                {t("magazine:desk.triage.maybe")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-describedby={titleId}
                onClick={() => onPass(pitch)}
              >
                {t("magazine:desk.triage.pass")}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
