import { useId, type MouseEvent } from "react";
import type { IconType } from "react-icons";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSquare,
} from "react-icons/fi";
import { Button, Collapse } from "../../../../../shared/components/ui";
import type {
  VjClipDTO,
  VjSceneDTO,
  VjSetlistDTO,
  VjStageState,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useVjSyncedNow } from "../../hooks/useVjSyncedNow";
import type { VjRemoteSetlistControls } from "../../page/VjRemoteShell";
import {
  VJ_SETLIST_PLAY_CONTROL_KEYS,
  VJ_SETLIST_STEP_GONE_KEYS,
  vjSetlistStepNameOf,
  vjSetlistNextIndex,
  vjSetlistPlayControlOf,
  vjSetlistPreviousIndex,
  vjSetlistStepPositionCopy,
  vjSetlistStepPositionOf,
  type VjSetlistPlayControl,
} from "../../rules/vjSetlistPlayback";
import { VjSetlistStatusLine } from "./VjSetlistStatusLine";
import styles from "./VjScenesSheet.module.css";

/** The play button's icon for each play control. */
const VJ_PLAY_CONTROL_ICONS: Readonly<Record<VjSetlistPlayControl, IconType>> =
  {
    play: FiPlay,
    pause: FiPause,
    resume: FiPlay,
    playAgain: FiRotateCcw,
  };

/**
 * Where the sequence stands: "Step 3 of 8: Warm up" (or "Ready at step 1"),
 * and while it plays the time its step has left, counted on the synced
 * clock and never past the step's own length.
 */
function VjSetlistPositionLine({
  setlist,
  state,
  scenesById,
  clipsById,
  controls,
}: Omit<VjSetlistActiveControlsProps, "isBlocked" | "onPress">) {
  const { t } = useTranslation();
  const playback = state.setlistPlayback;
  const isPlaying =
    playback.status === "playing" && playback.stepEndsAt !== null;
  const syncedNow = useVjSyncedNow(controls.clock, { isEnabled: isPlaying });
  const position = vjSetlistStepPositionOf(state, setlist);
  const positionText = (() => {
    if (position === null) {
      return t("vj:scenes.setlistCount", { count: setlist.items.length });
    }
    if (position.kind === "armed") {
      const copy = vjSetlistStepPositionCopy(position);
      return t(copy.key, copy.values);
    }
    const item = setlist.items[position.position - 1];
    const stepName =
      item === undefined
        ? null
        : (vjSetlistStepNameOf(item, scenesById, clipsById) ??
          t(VJ_SETLIST_STEP_GONE_KEYS[item.kind]));
    return stepName === null
      ? t("vj:scenes.stepPosition", {
          position: position.position,
          total: position.total,
        })
      : t("vj:mirror.nextSetlist", {
          position: position.position,
          total: position.total,
          name: stepName,
        });
  })();
  const msLeft =
    playback.stepEndsAt === null
      ? 0
      : Math.min(
          Math.max(0, playback.stepEndsAt - syncedNow),
          playback.stepDurationMs ?? Number.POSITIVE_INFINITY,
        );
  return (
    <div className={styles.positionBlock}>
      <p className={styles.setlistPosition}>{positionText}</p>
      <Collapse isOpen={isPlaying}>
        <p className={styles.positionTime} data-vj-setlist-time="">
          {t("vj:mirror.ringSetlist", { seconds: Math.ceil(msLeft / 1000) })}
        </p>
      </Collapse>
    </div>
  );
}

export interface VjSetlistActiveControlsProps {
  setlist: VjSetlistDTO;
  state: VjStageState;
  scenesById: ReadonlyMap<string, VjSceneDTO>;
  clipsById: ReadonlyMap<string, VjClipDTO>;
  controls: VjRemoteSetlistControls;
  isBlocked: boolean;
  /** A press here: the row names the refusal that answers it. */
  onPress: () => void;
}

/**
 * The sequence on stage: "Step 3 of 8: Warm up" with the time its step
 * has left, the status line naming why it
 * stopped, then the one play button (Play, Pause, Resume or Play again as
 * the status asks), Previous step and Next step, the Loop switch and Stop
 * sequence. While the timer waits before a flashing step, the warning panel
 * takes the play button's and Stop sequence's place, so each choice shows
 * once. Every press goes through the remote's sequence actions, which ask
 * the flash warning first where a step flashes.
 */
export function VjSetlistActiveControls({
  setlist,
  state,
  scenesById,
  clipsById,
  controls,
  isBlocked,
  onPress,
}: VjSetlistActiveControlsProps) {
  const { t } = useTranslation();
  const statusLineId = useId();
  const emptyReasonId = useId();
  const { actions, isCommandPending } = controls;
  const playback = state.setlistPlayback;
  const isPlayPending =
    isCommandPending("setlistSetPlaying") || isCommandPending("setlistSelect");
  const isStepPending =
    isCommandPending("setlistNext") || isCommandPending("setlistPrevious");
  const isPlayHeld = isBlocked || isPlayPending;
  const isStepHeld = isBlocked || isStepPending || isPlayPending;
  const itemCount = setlist.items.length;
  // The Loop switch as shown, so a step goes round the moment Loop is pressed.
  const isLooping = actions.setlistLoopIsOn(setlist.id, playback.isLooping);
  const isAtStart =
    vjSetlistPreviousIndex(state.setlistIndex, itemCount, isLooping) === null;
  const isAtEnd =
    vjSetlistNextIndex(state.setlistIndex, itemCount, isLooping) === null;
  const isFlashWaiting = playback.status === "needsFlashConsent";
  const playControl = vjSetlistPlayControlOf(playback.status);
  const PlayIcon = VJ_PLAY_CONTROL_ICONS[playControl];
  const hasReason =
    playback.status !== "manual" && playback.status !== "playing";
  // A sequence emptied while on stage holds its play button and says why.
  const isEmpty = itemCount === 0;
  const playDescribedBy =
    [isEmpty ? emptyReasonId : null, hasReason ? statusLineId : null]
      .filter((describedId): describedId is string => describedId !== null)
      .join(" ") || undefined;

  const press =
    (isHeld: boolean, send: (anchor: HTMLElement) => void) =>
    (event: MouseEvent<HTMLButtonElement>) => {
      if (isHeld) return;
      onPress();
      send(event.currentTarget);
    };

  return (
    <div className={styles.setlistControls} data-vj-setlist-controls="">
      <VjSetlistPositionLine
        setlist={setlist}
        state={state}
        scenesById={scenesById}
        clipsById={clipsById}
        controls={controls}
      />
      <Collapse isOpen={isEmpty}>
        <p id={emptyReasonId} className={styles.empty}>
          {t("vj:scenes.setlistEmptyReason")}
        </p>
      </Collapse>
      <VjSetlistStatusLine
        id={statusLineId}
        state={state}
        setlist={setlist}
        scenesById={scenesById}
        clipsById={clipsById}
        actions={actions.setlist}
        isHeld={isPlayHeld}
        onPress={onPress}
      />
      <Collapse isOpen={!isFlashWaiting}>
        <Button
          variant="stage"
          size="sm"
          className={styles.wideButton}
          data-vj-setlist-play={playControl}
          aria-describedby={playDescribedBy}
          aria-disabled={isPlayHeld || isEmpty || undefined}
          aria-busy={isPlayPending || undefined}
          onClick={press(isPlayHeld || isEmpty, (anchor) =>
            actions.setlist.togglePlaying(anchor),
          )}
        >
          <PlayIcon aria-hidden fill="none" />
          {t(VJ_SETLIST_PLAY_CONTROL_KEYS[playControl])}
        </Button>
      </Collapse>
      <div className={styles.stepButtons}>
        <Button
          variant="stage-ghost"
          size="sm"
          aria-disabled={isStepHeld || isAtStart || undefined}
          aria-busy={isCommandPending("setlistPrevious") || undefined}
          onClick={press(isStepHeld || isAtStart, (anchor) =>
            actions.setlist.step("previous", anchor),
          )}
        >
          <FiChevronLeft aria-hidden fill="none" />
          {t("vj:strip.setlistPrevious")}
        </Button>
        <Button
          variant="stage-ghost"
          size="sm"
          aria-disabled={isStepHeld || isAtEnd || undefined}
          aria-busy={isCommandPending("setlistNext") || undefined}
          onClick={press(isStepHeld || isAtEnd, (anchor) =>
            actions.setlist.step("next", anchor),
          )}
        >
          {t("vj:strip.setlistNext")}
          <FiChevronRight aria-hidden fill="none" />
        </Button>
      </div>
      <VjSetlistLoopSwitch
        setlistId={setlist.id}
        serverIsOn={playback.isLooping}
        controls={controls}
        isBlocked={isBlocked}
        onPress={onPress}
      />
      <Collapse isOpen={!isFlashWaiting}>
        <Button
          variant="stage-ghost"
          size="sm"
          className={styles.wideButton}
          aria-disabled={isPlayHeld || undefined}
          onClick={press(isPlayHeld, () => actions.setlist.stop())}
        >
          <FiSquare aria-hidden fill="none" />
          {t("vj:scenes.stopSetlist")}
        </Button>
      </Collapse>
    </div>
  );
}

/**
 * Loop: on, the sequence starts again from step 1 after its last step. The
 * switch shows the pressed value at once and rolls back, with its named
 * reason, when the stage refuses it.
 */
function VjSetlistLoopSwitch({
  setlistId,
  serverIsOn,
  controls,
  isBlocked,
  onPress,
}: {
  setlistId: string;
  serverIsOn: boolean;
  controls: VjRemoteSetlistControls;
  isBlocked: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const { actions } = controls;
  const isOn = actions.setlistLoopIsOn(setlistId, serverIsOn);
  const isPending = actions.isSetlistLoopPending(setlistId);
  return (
    <button
      type="button"
      role="switch"
      className={styles.loopSwitch}
      aria-checked={isOn}
      aria-label={t("vj:scenes.loop")}
      aria-disabled={isBlocked || undefined}
      aria-busy={isPending || undefined}
      aria-describedby={hintId}
      onClick={() => {
        if (isBlocked) return;
        onPress();
        actions.setlist.setLooping(!isOn);
      }}
    >
      <span className={styles.loopText}>
        <span>{t("vj:scenes.loop")}</span>
        <span id={hintId} className={styles.loopHint}>
          {t("vj:librarySetlists.loopHint")}
        </span>
      </span>
      <span className={styles.loopTrack} aria-hidden="true">
        <span className={styles.loopKnob} />
      </span>
    </button>
  );
}
