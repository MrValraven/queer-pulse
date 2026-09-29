import { useRovingRadioGroup } from "../../../shared/hooks/useRovingRadioGroup";
import type { Scale5 } from "../goTogetherQuestionnaire.data";
import { SCALE_POINTS } from "./questionnaireSteps.data";
import styles from "./GoTogetherQuestionnaire.module.css";

interface LikertScaleProps {
  /** The id of the visible row label that names this scale. */
  labelledBy: string;
  value: Scale5 | undefined;
  onChange: (score: Scale5) => void;
  /** Accessible name for each of the five points, low to high. */
  pointNames: readonly string[];
  /** The words under the two ends of the row. */
  lowAnchor: string;
  highAnchor: string;
}

/**
 * A 1 to 5 answer as a real radio group: the accessible replacement for a
 * slider. One tab stop for the whole row; the arrow keys move and select,
 * Home and End jump to the ends. Each point carries its full name for screen
 * readers, so the visible anchors under the row stay decorative.
 */
export function LikertScale({
  labelledBy,
  value,
  onChange,
  pointNames,
  lowAnchor,
  highAnchor,
}: LikertScaleProps) {
  const checkedIndex = value == null ? -1 : SCALE_POINTS.indexOf(value);
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: SCALE_POINTS.length,
    checkedIndex,
    onSelect: (index) => {
      const point = SCALE_POINTS[index];
      if (point != null) onChange(point);
    },
  });

  return (
    <div className={styles.likert}>
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        className={styles.likertPoints}
      >
        {SCALE_POINTS.map((point, index) => {
          const isChecked = value === point;
          return (
            <button
              key={point}
              {...getRadioProps(index)}
              type="button"
              role="radio"
              aria-checked={isChecked}
              aria-label={pointNames[index] ?? String(point)}
              data-checked={isChecked || undefined}
              className={styles.likertPoint}
              onClick={() => onChange(point)}
            >
              <span aria-hidden>{point}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.likertAnchors} aria-hidden>
        <span>{lowAnchor}</span>
        <span className={styles.likertAnchorHigh}>{highAnchor}</span>
      </div>
    </div>
  );
}
