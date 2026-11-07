import { useId, type RefObject } from "react";
import { FiZap } from "react-icons/fi";
import {
  VJ_TRANSITION_CATALOG,
  VJ_TRANSITION_IDS,
  type VjTransitionId,
  type VjTransitionLengthUnit,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjDockPopover } from "../kit/VjDockPopover";
import styles from "./VjDockRows.module.css";

const VJ_LENGTH_UNITS: readonly {
  unit: VjTransitionLengthUnit;
  labelKey: string;
}[] = [
  { unit: "beats", labelKey: "vj:transition.unitBeats" },
  { unit: "ms", labelKey: "vj:transition.unitSeconds" },
];

function vjTransitionModeKey(mode: VjTransitionId): string {
  return `vj:transition.mode.${mode}`;
}

export interface VjTransitionPickerProps {
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  mode: VjTransitionId;
  unit: VjTransitionLengthUnit;
  isBlocked: boolean;
  /** False while the stage tempo is unknown: a unit switch converts at it. */
  canSwitchUnit: boolean;
  onPickMode: (mode: VjTransitionId) => void;
  onPickUnit: (unit: VjTransitionLengthUnit) => void;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  describedBy?: string;
}

/**
 * The transition picker over the mode chip: the eleven transitions as a
 * two-column list (the shown one pressed), and the unit the length counts
 * in. Flash-capable transitions (dip to white, glitch) carry a flash mark
 * and the note on the flash limit; the row asks for flash consent before
 * sending one. The unit switch folds away for Cut, which has no length.
 */
export function VjTransitionPicker({
  anchorRef,
  isOpen,
  onClose,
  mode,
  unit,
  isBlocked,
  canSwitchUnit,
  onPickMode,
  onPickUnit,
  describedBy,
}: VjTransitionPickerProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const flashNoteId = useId();
  const unitLabelId = useId();
  return (
    <VjDockPopover
      anchorRef={anchorRef}
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
    >
      <div className={styles.popoverBody} data-vj-transition-picker="">
        <p id={titleId} className={styles.popoverTitle}>
          {t("vj:transition.title")}
        </p>
        <div
          className={styles.popoverGrid}
          role="group"
          aria-labelledby={titleId}
        >
          {VJ_TRANSITION_IDS.map((transitionId) => {
            const isFlashCapable =
              VJ_TRANSITION_CATALOG[transitionId].isFlashCapable;
            return (
              <button
                key={transitionId}
                type="button"
                className={styles.chip}
                data-vj-transition-mode={transitionId}
                aria-pressed={transitionId === mode}
                aria-disabled={isBlocked || undefined}
                aria-describedby={
                  [isFlashCapable ? flashNoteId : null, describedBy]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                onClick={() => onPickMode(transitionId)}
              >
                {isFlashCapable && <FiZap aria-hidden fill="none" />}
                <span className={styles.modeName}>
                  {t(vjTransitionModeKey(transitionId))}
                </span>
              </button>
            );
          })}
        </div>
        <p id={flashNoteId} className={styles.note}>
          <FiZap aria-hidden fill="none" />
          <span>{t("vj:transition.flashNote")}</span>
        </p>
        <Collapse isOpen={mode !== "cut"}>
          <div className={styles.popoverBody}>
            <p id={unitLabelId} className={styles.fieldLabel}>
              {t("vj:transition.unitAria")}
            </p>
            <div
              className={styles.popoverGrid}
              role="group"
              aria-labelledby={unitLabelId}
            >
              {VJ_LENGTH_UNITS.map((option) => (
                <button
                  key={option.unit}
                  type="button"
                  className={styles.chip}
                  aria-pressed={option.unit === unit}
                  aria-disabled={isBlocked || !canSwitchUnit || undefined}
                  aria-describedby={describedBy}
                  onClick={() => onPickUnit(option.unit)}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </Collapse>
      </div>
    </VjDockPopover>
  );
}
