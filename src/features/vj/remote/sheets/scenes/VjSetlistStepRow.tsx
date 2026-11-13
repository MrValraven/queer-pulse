import { useId, useState } from "react";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import {
  Button,
  Collapse,
  IconButton,
} from "../../../../../shared/components/ui";
import type { VjStepDuration } from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { VjStepDurationPicker } from "../../../library/show/VjStepDurationPicker";
import {
  vjStepDurationTextOf,
  type VjSetlistSlot,
} from "../../../library/show/vjSetlistSlots";
import styles from "./VjScenesSheet.module.css";

export interface VjSetlistStepRowProps {
  slot: VjSetlistSlot;
  /** The scene name or clip title the row and its buttons speak. */
  stepName: string;
  setlistName: string;
  /** The row's index in the sequence, from 0. */
  position: number;
  total: number;
  /** The sequence default, which a step on its default length plays. */
  defaultDuration: VjStepDuration;
  /** This step is the one on screen. */
  isCurrent: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  /** A new length for this step, or null for the sequence default. */
  onDurationChange: (duration: VjStepDuration | null) => void;
}

/**
 * One step in the remote's steps panel: its number, name and kind, its
 * length (a button that folds the length picker open under the row), then
 * Move up, Move down and Remove, each a 44px target. The step on screen
 * carries a filled number and aria-current.
 */
export function VjSetlistStepRow({
  slot,
  stepName,
  setlistName,
  position,
  total,
  defaultDuration,
  isCurrent,
  onMove,
  onRemove,
  onDurationChange,
}: VjSetlistStepRowProps) {
  const { t } = useTranslation();
  const lengthPanelId = useId();
  const [isLengthOpen, setIsLengthOpen] = useState(false);
  const isFirst = position === 0;
  const isLast = position >= total - 1;
  const lengthText =
    slot.duration === null
      ? t("vj:setlistItems.lengthDefault", {
          length: vjStepDurationTextOf(defaultDuration, t),
        })
      : vjStepDurationTextOf(slot.duration, t);
  const lengthLabel = t("vj:setlistItems.lengthLabel", { step: stepName });

  return (
    <div
      className={styles.stepRow}
      data-vj-setlist-step={slot.key}
      data-is-current={isCurrent ? "true" : undefined}
      aria-current={isCurrent ? "step" : undefined}
    >
      <div className={styles.stepMain}>
        <span className={styles.stepNumber} aria-hidden="true">
          {position + 1}
        </span>
        <span className={styles.stepText}>
          <span className={styles.stepName}>{stepName}</span>
          <span className={styles.stepKind}>
            {slot.kind === "clip"
              ? t("vj:setlistItems.kindClip")
              : t("vj:setlistItems.kindScene")}
          </span>
        </span>
        <span className={styles.stepTools}>
          <IconButton
            tone="dark"
            aria-label={t("vj:setlistItems.moveUp", { step: stepName })}
            aria-disabled={isFirst || undefined}
            onClick={() => {
              if (!isFirst) onMove(-1);
            }}
          >
            <FiChevronUp aria-hidden fill="none" focusable="false" />
          </IconButton>
          <IconButton
            tone="dark"
            aria-label={t("vj:setlistItems.moveDown", { step: stepName })}
            aria-disabled={isLast || undefined}
            onClick={() => {
              if (!isLast) onMove(1);
            }}
          >
            <FiChevronDown aria-hidden fill="none" focusable="false" />
          </IconButton>
          <IconButton
            tone="dark"
            aria-label={t("vj:setlistItems.remove", {
              step: stepName,
              setlist: setlistName,
            })}
            onClick={onRemove}
          >
            <FiX aria-hidden fill="none" focusable="false" />
          </IconButton>
        </span>
      </div>
      <Button
        variant="stage-ghost"
        size="sm"
        className={styles.stepLength}
        aria-expanded={isLengthOpen}
        aria-controls={isLengthOpen ? lengthPanelId : undefined}
        data-custom={slot.duration === null ? undefined : "true"}
        onClick={() => setIsLengthOpen((wasOpen) => !wasOpen)}
      >
        <span className={styles.visuallyHidden}>{lengthLabel}: </span>
        {lengthText}
      </Button>
      <Collapse isOpen={isLengthOpen}>
        <div id={lengthPanelId} className={styles.stepLengthPanel}>
          <VjStepDurationPicker
            label={lengthLabel}
            value={slot.duration}
            defaultDuration={defaultDuration}
            onChange={onDurationChange}
          />
        </div>
      </Collapse>
    </div>
  );
}
