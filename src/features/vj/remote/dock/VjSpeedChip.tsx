import { useId, useRef, useState } from "react";
import {
  VJ_SPEEDS,
  type VjMediaKind,
  type VjSpeed,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import {
  useVjOptimisticValue,
  type VjSendRefusal,
} from "../hooks/useVjOptimisticValue";
import { VjDockPopover } from "../kit/VjDockPopover";
import styles from "./VjDockRows.module.css";

const VJ_SPEED_KEY = "speed";

export interface VjSpeedChipProps {
  speed: VjSpeed;
  liveMediaKind: VjMediaKind | null;
  isBlocked: boolean;
  stateRevision: number | null;
  setSpeed: (speed: VjSpeed) => Promise<VjCommandOutcome>;
  onRefused?: (refusal: VjSendRefusal) => void;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  describedBy?: string;
}

/**
 * The clip speed chip at the end of the transition row, a "Speed" caption
 * over the speed (the pads strip folds the caption). It opens the six
 * speeds; a pick shows at once and rolls back with its named reason on a
 * refusal. While a GIF plays live the note says GIFs keep their own speed.
 */
export function VjSpeedChip({
  speed,
  liveMediaKind,
  isBlocked,
  stateRevision,
  setSpeed,
  onRefused,
  describedBy,
}: VjSpeedChipProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const titleId = useId();
  const chipRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const optimistic = useVjOptimisticValue<VjSpeed>({
    stateRevision,
    onRefused: onRefused && ((refusal) => onRefused(refusal)),
  });
  const shownSpeed = optimistic.valueOf(VJ_SPEED_KEY, speed);
  const speedText = (value: VjSpeed) =>
    t("vj:effects.speedValue", { speed: format.number(value) });

  const pickSpeed = (nextSpeed: VjSpeed) => {
    if (isBlocked) return;
    setIsOpen(false);
    if (nextSpeed === shownSpeed) return;
    void optimistic.apply(VJ_SPEED_KEY, nextSpeed, () => setSpeed(nextSpeed));
  };

  return (
    <>
      <button
        ref={chipRef}
        type="button"
        className={`${styles.chip} ${styles.captionChip} ${styles.speedChip}`}
        data-vj-speed-chip=""
        aria-label={t("vj:transition.speedAria", {
          speed: format.number(shownSpeed),
        })}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span
          className={`${styles.chipCaption} ${styles.foldingCaption}`}
          aria-hidden="true"
        >
          {t("vj:effects.speed")}
        </span>
        <span
          className={`${styles.chipNumber} ${styles.speedNumber}`}
          aria-hidden="true"
        >
          {speedText(shownSpeed)}
        </span>
      </button>
      <VjDockPopover
        anchorRef={chipRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        labelledBy={titleId}
      >
        <div className={styles.popoverBody} data-vj-speed-popover="">
          <p id={titleId} className={styles.popoverTitle}>
            {t("vj:effects.speed")}
          </p>
          <div
            className={styles.popoverGridThree}
            role="group"
            aria-labelledby={titleId}
          >
            {VJ_SPEEDS.map((option) => (
              <button
                key={option}
                type="button"
                className={styles.chip}
                aria-pressed={option === shownSpeed}
                aria-disabled={isBlocked || undefined}
                aria-describedby={describedBy}
                onClick={() => pickSpeed(option)}
              >
                {speedText(option)}
              </button>
            ))}
          </div>
          <Collapse isOpen={liveMediaKind === "gif"}>
            <p className={styles.note}>{t("vj:effects.gifSpeedNote")}</p>
          </Collapse>
        </div>
      </VjDockPopover>
    </>
  );
}
