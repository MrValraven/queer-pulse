import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiPauseCircle,
  FiPlay,
  FiSkipForward,
  FiSquare,
} from "react-icons/fi";
import { Button, Collapse } from "../../../../../shared/components/ui";
import type {
  VjClipDTO,
  VjSceneDTO,
  VjSetlistDTO,
  VjSetlistItemDTO,
  VjStageState,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjSetlistRemoteActions } from "../../page/useVjRemoteActions";
import {
  VJ_SETLIST_STEP_GONE_KEYS,
  vjSetlistReasonCopyOf,
  vjSetlistReasonLineOf,
  vjSetlistSkipFlashingIndexOf,
  vjSetlistStepNameOf,
  type VjSetlistCopy,
  type VjSetlistReasonLine,
} from "../../rules/vjSetlistPlayback";
import styles from "./VjScenesSheet.module.css";

/** The mark beside each reason, so the line never rests on colour alone. */
const VJ_REASON_ICONS: Readonly<
  Record<Exclude<VjSetlistReasonLine, null>, IconType>
> = {
  takenOverPick: FiPauseCircle,
  takenOverShuffle: FiPauseCircle,
  finished: FiCheckCircle,
  flashWaiting: FiAlertTriangle,
  paused: FiPauseCircle,
};

/** What the line shows; kept while it folds so the words stay put mid-motion. */
interface VjShownReason {
  reasonLine: Exclude<VjSetlistReasonLine, null>;
  copy: VjSetlistCopy;
  canSkip: boolean;
}

export interface VjSetlistStatusLineProps {
  /** The line's id: the play control under it points here with aria-describedby. */
  id: string;
  state: VjStageState;
  setlist: VjSetlistDTO;
  scenesById: ReadonlyMap<string, VjSceneDTO>;
  clipsById: ReadonlyMap<string, VjClipDTO>;
  actions: VjSetlistRemoteActions;
  /** Offline, or a play or select waits for its ack: the panel's buttons hold. */
  isHeld: boolean;
  onPress: () => void;
}

/**
 * Why the active sequence stopped moving: "Paused, you picked a clip",
 * "Sequence finished", "Paused with 6 s left on this step", each with its
 * mark. The play control right under the line is its action (Resume or
 * Play again). While the timer waits before a flashing step, the line
 * names that step in the warning panel with Play the flashing step, Skip
 * the flashing step (when a later step plays without flashing) and Stop
 * sequence. It folds open and away with the shared Collapse; a hidden
 * status line, outside the panel, announces each new reason.
 */
export function VjSetlistStatusLine({
  id,
  state,
  setlist,
  scenesById,
  clipsById,
  actions,
  isHeld,
  onPress,
}: VjSetlistStatusLineProps) {
  const { t } = useTranslation();
  const stepNameOf = (item: VjSetlistItemDTO | null): string => {
    // The step cannot be read: the line names the sequence instead.
    if (item === null) return setlist.name;
    return (
      vjSetlistStepNameOf(item, scenesById, clipsById) ??
      t(VJ_SETLIST_STEP_GONE_KEYS[item.kind])
    );
  };
  const reasonLine = vjSetlistReasonLineOf(state);
  const copy = vjSetlistReasonCopyOf(state, setlist, stepNameOf);
  const currentReason: VjShownReason | null =
    reasonLine === null || copy === null
      ? null
      : {
          reasonLine,
          copy,
          canSkip:
            vjSetlistSkipFlashingIndexOf(state, setlist, scenesById) !== null,
        };
  const [lastReason, setLastReason] = useState(currentReason);
  const isSameReason =
    currentReason !== null &&
    lastReason !== null &&
    currentReason.reasonLine === lastReason.reasonLine &&
    currentReason.canSkip === lastReason.canSkip &&
    t(currentReason.copy.key, currentReason.copy.values) ===
      t(lastReason.copy.key, lastReason.copy.values);
  if (currentReason !== null && !isSameReason) setLastReason(currentReason);
  const shownReason = currentReason ?? lastReason;

  const press = (send: () => void) => {
    if (isHeld) return;
    onPress();
    send();
  };

  const currentText =
    currentReason === null
      ? ""
      : t(currentReason.copy.key, currentReason.copy.values);
  // The live region holds the words only, so the flash panel's buttons sit
  // outside it; it stays mounted, so each new reason is heard. The visible
  // words are hidden from screen readers, so they are read once, and the
  // play button still takes them as its description by id.
  return (
    <div className={styles.statusRegion}>
      <p role="status" className={styles.visuallyHidden}>
        {currentText}
      </p>
      <Collapse isOpen={currentReason !== null}>
        {shownReason === null ? null : (
          <VjSetlistReason
            id={id}
            reason={shownReason}
            text={t(shownReason.copy.key, shownReason.copy.values)}
            isHeld={isHeld}
            onPlayFlashing={() => press(actions.playFlashing)}
            onSkipFlashing={() => press(actions.skipFlashing)}
            onStop={() => press(actions.stop)}
          />
        )}
      </Collapse>
    </div>
  );
}

/** One reason: a quiet line, or the flash warning panel with its three choices. */
function VjSetlistReason({
  id,
  reason,
  text,
  isHeld,
  onPlayFlashing,
  onSkipFlashing,
  onStop,
}: {
  id: string;
  reason: VjShownReason;
  text: string;
  isHeld: boolean;
  onPlayFlashing: () => void;
  onSkipFlashing: () => void;
  onStop: () => void;
}) {
  const { t } = useTranslation();
  const ReasonIcon = VJ_REASON_ICONS[reason.reasonLine];
  if (reason.reasonLine !== "flashWaiting") {
    return (
      <p id={id} className={styles.statusLine} aria-hidden="true">
        <ReasonIcon aria-hidden fill="none" className={styles.statusIcon} />
        <span>{text}</span>
      </p>
    );
  }
  return (
    <div className={styles.flashPanel} data-vj-setlist-flash="">
      <p id={id} className={styles.flashText} aria-hidden="true">
        <ReasonIcon aria-hidden fill="none" className={styles.flashIcon} />
        <span>{text}</span>
      </p>
      <div className={styles.flashActions}>
        <Button
          variant="stage"
          size="sm"
          aria-disabled={isHeld || undefined}
          onClick={onPlayFlashing}
        >
          <FiPlay aria-hidden fill="none" />
          {t("vj:scenes.playFlashing")}
        </Button>
        <Collapse isOpen={reason.canSkip}>
          <Button
            variant="stage-ghost"
            size="sm"
            className={styles.wideButton}
            aria-disabled={isHeld || undefined}
            onClick={onSkipFlashing}
          >
            <FiSkipForward aria-hidden fill="none" />
            {t("vj:scenes.skipFlashing")}
          </Button>
        </Collapse>
        <Button
          variant="stage-ghost"
          size="sm"
          aria-disabled={isHeld || undefined}
          onClick={onStop}
        >
          <FiSquare aria-hidden fill="none" />
          {t("vj:scenes.stopSetlist")}
        </Button>
      </div>
    </div>
  );
}
