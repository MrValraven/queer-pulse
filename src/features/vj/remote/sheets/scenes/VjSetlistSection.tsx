import { AnimatePresence } from "motion/react";
import { useId, useState, type MouseEvent } from "react";
import {
  FiAlertTriangle,
  FiChevronDown,
  FiEdit2,
  FiList,
  FiPlay,
  FiSkipForward,
} from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../../shared/components/ui";
import type {
  VjClipDTO,
  VjSceneDTO,
  VjSetlistDTO,
  VjStageState,
} from "../../../../../shared/contracts/vj";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useVjSetlistMutations } from "../../../api/useVjSetlistMutations";
import type { VjRemoteSetlistControls } from "../../page/VjRemoteShell";
import { isVjSetlistPlayable } from "../../rules/vjSetlistPlayback";
import type { VjSceneMutations, VjScenesSheetFeedback } from "./VjSceneRow";
import { VjSetlistActiveControls } from "./VjSetlistActiveControls";
import { VjSetlistStepsPanel } from "./VjSetlistStepsPanel";
import styles from "./VjScenesSheet.module.css";

/** What every sequence row reads from the sheet. */
interface VjSetlistRowContext {
  state: VjStageState;
  scenes: readonly VjSceneDTO[];
  scenesById: ReadonlyMap<string, VjSceneDTO>;
  clipsById: ReadonlyMap<string, VjClipDTO>;
  controls: VjRemoteSetlistControls;
  activePackId: string | null;
  createScene: VjSceneMutations["createScene"];
  feedback: VjScenesSheetFeedback;
}

/** What a press saw: the refusal standing when it happened, if any. */
interface VjRowPress {
  standingStamp: object | null;
}

/**
 * The stage's refusal for a press in this row: only one newer than the
 * press (its stamp differs from the one standing at the press), so a
 * refusal already on the status line never shows under a fresh tap, and
 * a landed command, which clears the stamp, folds it away.
 */
function useVjRowRefusal(controls: VjRemoteSetlistControls) {
  const [press, setPress] = useState<VjRowPress | null>(null);
  const { errorKey, errorValues, refusalStamp } = controls;
  const isNewer =
    press !== null &&
    refusalStamp !== null &&
    refusalStamp !== press.standingStamp;
  return {
    notePress: () => setPress({ standingStamp: refusalStamp }),
    errorKey: isNewer ? errorKey : null,
    errorValues: isNewer && errorValues !== null ? { ...errorValues } : {},
  };
}

/**
 * The row's refusal line. It carries no live role: the dock's status line
 * already announces the same refusal, so a screen reader hears it once.
 * It keeps the last words while it folds away.
 */
function VjSetlistRefusalLine({
  errorKey,
  values,
}: {
  errorKey: string | null;
  values: TranslateOptions;
}) {
  const { t } = useTranslation();
  const [shown, setShown] = useState({ errorKey, values });
  if (errorKey !== null && errorKey !== shown.errorKey) {
    setShown({ errorKey, values });
  }
  return (
    <Collapse isOpen={errorKey !== null}>
      <p className={styles.rowRefusal} data-vj-setlist-refusal="">
        <FiAlertTriangle
          aria-hidden
          fill="none"
          className={styles.rowRefusalIcon}
        />
        <span>
          {shown.errorKey === null ? "" : t(shown.errorKey, shown.values)}
        </span>
      </p>
    </Collapse>
  );
}

/**
 * Play sequence and Step through for a sequence that rests; an empty one
 * holds both and says why. Each keeps its visible words as its name and
 * takes the sequence's name as its description.
 */
function VjSetlistRestingControls({
  setlist,
  nameId,
  context,
  onPress,
}: {
  setlist: VjSetlistDTO;
  nameId: string;
  context: VjSetlistRowContext;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const emptyReasonId = useId();
  const { actions, isCommandPending } = context.controls;
  const isPlayable = isVjSetlistPlayable(setlist);
  const isPending =
    isCommandPending("setlistSelect") || isCommandPending("setlistSetPlaying");
  const isHeld = context.feedback.isBlocked || isPending || !isPlayable;
  const describedBy = isPlayable ? nameId : `${nameId} ${emptyReasonId}`;
  const press =
    (send: (anchor: HTMLElement) => void) =>
    (event: MouseEvent<HTMLButtonElement>) => {
      if (isHeld) return;
      onPress();
      send(event.currentTarget);
    };
  return (
    <div className={styles.setlistControls}>
      <div className={styles.stepButtons}>
        <Button
          variant="stage"
          size="sm"
          aria-describedby={describedBy}
          aria-disabled={isHeld || undefined}
          onClick={press((anchor) => actions.setlist.play(setlist.id, anchor))}
        >
          <FiPlay aria-hidden fill="none" />
          {t("vj:scenes.playSetlist")}
        </Button>
        <Button
          variant="stage-ghost"
          size="sm"
          aria-describedby={describedBy}
          aria-disabled={isHeld || undefined}
          onClick={press((anchor) =>
            actions.setlist.stepThrough(setlist.id, anchor),
          )}
        >
          <FiSkipForward aria-hidden fill="none" />
          {t("vj:scenes.startSetlist")}
        </Button>
      </div>
      <Collapse isOpen={!isPlayable}>
        <p id={emptyReasonId} className={styles.empty}>
          {t("vj:scenes.setlistEmptyReason")}
        </p>
      </Collapse>
    </div>
  );
}

/**
 * One sequence: its name and step count; Play sequence and Step through
 * while it rests, the active controls once it is on stage; Edit steps folds
 * the steps panel open under it. The stage's refusal for a press here shows
 * in the row itself, beside the control that was pressed.
 */
function VjSetlistRow({
  setlist,
  context,
}: {
  setlist: VjSetlistDTO;
  context: VjSetlistRowContext;
}) {
  const { t } = useTranslation();
  const nameId = useId();
  const stepsPanelId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const refusal = useVjRowRefusal(context.controls);
  const { state } = context;
  const isActive = state.activeSetlistId === setlist.id;

  return (
    <div
      className={styles.row}
      data-is-active={isActive}
      data-vj-setlist-row={setlist.id}
    >
      <div className={styles.setlistHead}>
        <p id={nameId} className={styles.rowName}>
          {setlist.name}
        </p>
        {/* On stage the position line says the count, so it folds away. */}
        <Collapse isOpen={!isActive}>
          <p className={styles.rowMeta}>
            {t("vj:scenes.setlistCount", { count: setlist.items.length })}
          </p>
        </Collapse>
      </div>
      <Collapse isOpen={!isActive}>
        <VjSetlistRestingControls
          setlist={setlist}
          nameId={nameId}
          context={context}
          onPress={refusal.notePress}
        />
      </Collapse>
      <Collapse isOpen={isActive}>
        <VjSetlistActiveControls
          setlist={setlist}
          state={state}
          scenesById={context.scenesById}
          clipsById={context.clipsById}
          controls={context.controls}
          isBlocked={context.feedback.isBlocked}
          onPress={refusal.notePress}
        />
      </Collapse>
      <VjSetlistRefusalLine
        errorKey={refusal.errorKey}
        values={refusal.errorValues}
      />
      <Button
        variant="stage-ghost"
        size="sm"
        className={styles.wideButton}
        aria-describedby={nameId}
        aria-expanded={isEditing}
        aria-controls={isEditing ? stepsPanelId : undefined}
        onClick={() => setIsEditing((wasEditing) => !wasEditing)}
      >
        <FiEdit2 aria-hidden fill="none" />
        {t("vj:scenes.editSteps")}
        <FiChevronDown aria-hidden fill="none" className={styles.editChevron} />
      </Button>
      <Collapse isOpen={isEditing}>
        <div id={stepsPanelId}>
          <VjSetlistStepsPanel
            setlist={setlist}
            state={state}
            scenes={context.scenes}
            scenesById={context.scenesById}
            clipsById={context.clipsById}
            activePackId={context.activePackId}
            createScene={context.createScene}
            announce={context.feedback.announce}
            onClose={() => setIsEditing(false)}
          />
        </div>
      </Collapse>
    </div>
  );
}

export interface VjSetlistSectionProps {
  setlists: readonly VjSetlistDTO[];
  state: VjStageState;
  /** The scenes the sheet shows (this pack's, then any pack's), in order. */
  sceneIdsForNewSetlist: readonly string[];
  /** "Sequence 3": the next default name no sequence holds yet. */
  nextSetlistName: string;
  /** Every scene the library holds: step names, and the names Add live look must not take. */
  scenes: readonly VjSceneDTO[];
  scenesById: ReadonlyMap<string, VjSceneDTO>;
  /** Every clip the remote knows, by id: a clip step's title. */
  clipsById: ReadonlyMap<string, VjClipDTO>;
  controls: VjRemoteSetlistControls;
  activePackId: string | null;
  createScene: VjSceneMutations["createScene"];
  feedback: VjScenesSheetFeedback;
}

/**
 * The sequences: each with its step count, Play sequence, Step through and
 * Edit steps; the one on stage shows its position, why it paused, the play
 * button, the steps, Loop and Stop sequence. Every play and step goes
 * through the remote's sequence actions, so a flashing step asks the flash
 * warning first. Make a sequence from these scenes posts the sheet's
 * scenes in order.
 */
export function VjSetlistSection({
  setlists,
  state,
  sceneIdsForNewSetlist,
  nextSetlistName,
  scenes,
  scenesById,
  clipsById,
  controls,
  activePackId,
  createScene,
  feedback,
}: VjSetlistSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const { createSetlist } = useVjSetlistMutations();
  const isMakeHeld =
    createSetlist.isPending || sceneIdsForNewSetlist.length === 0;
  const rowContext: VjSetlistRowContext = {
    state,
    scenes,
    scenesById,
    clipsById,
    controls,
    activePackId,
    createScene,
    feedback,
  };

  const makeSetlist = () => {
    if (isMakeHeld) return;
    void createSetlist
      .mutateAsync({
        name: nextSetlistName,
        sceneIds: [...sceneIdsForNewSetlist],
      })
      .then((createdSetlist) => {
        feedback.clearAlert();
        feedback.announce(
          t("vj:librarySetlists.created", { name: createdSetlist.name }),
        );
      }, feedback.showCause);
  };

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.groupTitle}>
        {t("vj:scenes.setlists")}
      </h3>
      <Collapse isOpen={setlists.length === 0}>
        <p className={styles.empty}>{t("vj:scenes.setlistEmpty")}</p>
      </Collapse>
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {setlists.map((setlist) => (
            <CollapseListItem key={setlist.id}>
              <VjSetlistRow setlist={setlist} context={rowContext} />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Button
        variant="stage-ghost"
        className={styles.wideButton}
        aria-disabled={isMakeHeld || undefined}
        aria-busy={createSetlist.isPending || undefined}
        onClick={makeSetlist}
      >
        <FiList aria-hidden fill="none" />
        {t("vj:scenes.makeSetlist")}
      </Button>
    </section>
  );
}
