import type { CSSProperties } from "react";
import { DeskFocusChipMark } from "./DeskFocusChipMark";
import { DESK_FOCUS_DEFINITIONS, type DeskFocusId } from "./deskFocus";
import { cx } from "../../../shared/lib/cx";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskFocusBar.module.css";

/** One chip's resolved display state: its definition, this render's count,
 *  and whether its filter is active. */
export interface DeskFocusChipState {
  id: DeskFocusId;
  labelKey: string;
  tone: (typeof DESK_FOCUS_DEFINITIONS)[number]["tone"];
  count: number;
  isActive: boolean;
}

function toneStyle(tone: DeskFocusChipState["tone"]): CSSProperties {
  return {
    "--focus-tone": `var(--desk-tone-${tone})`,
    "--focus-tone-soft": `var(--desk-tone-${tone}-soft)`,
  } as CSSProperties;
}

/**
 * One focus chip in `DeskFocusBar`'s row: its tone dot, label and count,
 * pressed to toggle the filter on or off. Pulled out of the bar so every
 * chip, including the ones "+N" reveals, renders from the same markup.
 */
export function DeskFocusChip({
  chip,
  onToggle,
}: {
  chip: DeskFocusChipState;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <button
      type="button"
      aria-pressed={chip.isActive}
      className={cx(
        styles.chip,
        chip.count === 0 && !chip.isActive && styles.chipMuted,
        chip.isActive && styles.chipActive,
      )}
      style={toneStyle(chip.tone)}
      onClick={onToggle}
    >
      {chip.count > 0 && <DeskFocusChipMark id={chip.id} tone={chip.tone} />}
      <span>{t(chip.labelKey)}</span>{" "}
      <span className={styles.count}>
        {chip.count > 0 ? (
          <RollingNumber
            value={fmt.number(chip.count)}
            numericValue={chip.count}
          />
        ) : (
          t("magazine:desk.focus.none")
        )}
      </span>
    </button>
  );
}
