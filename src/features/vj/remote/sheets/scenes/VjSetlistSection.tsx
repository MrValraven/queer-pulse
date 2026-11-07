import { AnimatePresence } from "motion/react";
import { useId, type MouseEvent } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiPlay,
  FiSquare,
} from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../../shared/components/ui";
import type {
  VjSceneDTO,
  VjSetlistDTO,
  VjStageState,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useVjSetlistMutations } from "../../../api/useVjSetlistMutations";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import type {
  VjRun,
  VjSceneFlashConsentRequest,
  VjScenesSheetFeedback,
} from "./VjSceneRow";
import styles from "./VjScenesSheet.module.css";

const SETLIST_PENDING_KEY = "setlist";

/** What a set list button needs to ask the flash warning for the scene it lands on. */
interface VjSetlistFlashCheck {
  scenesById: ReadonlyMap<string, VjSceneDTO>;
  requestSceneFlashConsent: VjSceneFlashConsentRequest;
}

/**
 * Runs `send` once the scene at `itemIndex` may play: through the flash
 * warning when its look flashes, at once otherwise. A scene the library has
 * not loaded has no look to check, so its send goes straight out and the
 * stage plays what the server holds.
 */
function sendVjSetlistStep(
  setlist: VjSetlistDTO,
  itemIndex: number,
  flashCheck: VjSetlistFlashCheck,
  anchor: HTMLElement,
  send: () => void,
): void {
  const sceneId = setlist.items[itemIndex]?.sceneId;
  const scene =
    sceneId === undefined ? undefined : flashCheck.scenesById.get(sceneId);
  if (scene === undefined) {
    send();
    return;
  }
  flashCheck.requestSceneFlashConsent(scene, anchor, send);
}

/** The playing set list's controls: where the show stands, then Previous
 *  scene, Next scene and Stop set list. */
function VjActiveSetlistControls({
  setlist,
  setlistIndex,
  run,
  flashCheck,
  feedback,
}: {
  setlist: VjSetlistDTO;
  setlistIndex: number | null;
  run: VjRun;
  flashCheck: VjSetlistFlashCheck;
  feedback: VjScenesSheetFeedback;
}) {
  const { t } = useTranslation();
  const isHeld = feedback.isBlocked || feedback.pendingKey !== null;
  const isBusy = feedback.pendingKey === SETLIST_PENDING_KEY;
  const itemCount = setlist.items.length;
  const isAtStart = setlistIndex === null || setlistIndex <= 0;
  const isAtEnd = setlistIndex !== null && setlistIndex >= itemCount - 1;
  const send = (
    isAllowed: boolean,
    command: () => Promise<VjCommandOutcome>,
  ) => {
    if (isHeld || !isAllowed) return;
    feedback.runCommand(SETLIST_PENDING_KEY, command);
  };
  // A step recalls the scene it lands on, so it asks the flash warning first.
  const sendStep = (
    isAllowed: boolean,
    targetIndex: number,
    anchor: HTMLElement,
    command: () => Promise<VjCommandOutcome>,
  ) => {
    if (isHeld || !isAllowed) return;
    sendVjSetlistStep(setlist, targetIndex, flashCheck, anchor, () =>
      feedback.runCommand(SETLIST_PENDING_KEY, command),
    );
  };

  return (
    <div className={styles.setlistControls}>
      <p className={styles.setlistPosition}>
        {setlistIndex === null
          ? t("vj:scenes.setlistCount", { count: itemCount })
          : t("vj:strip.setlistPosition", {
              position: setlistIndex + 1,
              total: itemCount,
            })}
      </p>
      <div className={styles.stepButtons}>
        <Button
          variant="stage-ghost"
          size="sm"
          aria-disabled={isHeld || isAtStart || undefined}
          aria-busy={isBusy || undefined}
          onClick={(event: MouseEvent<HTMLButtonElement>) =>
            sendStep(
              !isAtStart,
              (setlistIndex ?? 0) - 1,
              event.currentTarget,
              () => run("setlistPrevious"),
            )
          }
        >
          <FiChevronLeft aria-hidden fill="none" />
          {t("vj:strip.setlistPrevious")}
        </Button>
        <Button
          variant="stage"
          size="sm"
          aria-disabled={isHeld || isAtEnd || undefined}
          aria-busy={isBusy || undefined}
          onClick={(event: MouseEvent<HTMLButtonElement>) =>
            sendStep(
              !isAtEnd,
              setlistIndex === null ? 0 : setlistIndex + 1,
              event.currentTarget,
              () => run("setlistNext"),
            )
          }
        >
          {t("vj:strip.setlistNext")}
          <FiChevronRight aria-hidden fill="none" />
        </Button>
      </div>
      <Button
        variant="stage-ghost"
        size="sm"
        aria-disabled={isHeld || undefined}
        onClick={() => send(true, () => run("setlistSelect", null, null))}
      >
        <FiSquare aria-hidden fill="none" />
        {t("vj:scenes.stopSetlist")}
      </Button>
    </div>
  );
}

/** One set list: its name and scene count, Start set list while it rests,
 *  and the step controls folding open once it plays. */
function VjSetlistRow({
  setlist,
  isActive,
  setlistIndex,
  run,
  flashCheck,
  feedback,
}: {
  setlist: VjSetlistDTO;
  isActive: boolean;
  setlistIndex: number | null;
  run: VjRun;
  flashCheck: VjSetlistFlashCheck;
  feedback: VjScenesSheetFeedback;
}) {
  const { t } = useTranslation();
  const nameId = useId();
  const isEmpty = setlist.items.length === 0;
  const isStartHeld =
    feedback.isBlocked || feedback.pendingKey !== null || isEmpty;

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
        <p className={styles.rowMeta}>
          {t("vj:scenes.setlistCount", { count: setlist.items.length })}
        </p>
      </div>
      <Collapse isOpen={!isActive}>
        <Button
          variant="stage-ghost"
          size="sm"
          className={styles.wideButton}
          aria-describedby={nameId}
          aria-disabled={isStartHeld || undefined}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            if (isStartHeld) return;
            // Starting recalls item 0, so its scene's look is the one to check.
            sendVjSetlistStep(setlist, 0, flashCheck, event.currentTarget, () =>
              feedback.runCommand(SETLIST_PENDING_KEY, () =>
                run("setlistSelect", setlist.id, 0),
              ),
            );
          }}
        >
          <FiPlay aria-hidden fill="none" />
          {t("vj:scenes.startSetlist")}
        </Button>
      </Collapse>
      <Collapse isOpen={isActive}>
        <VjActiveSetlistControls
          setlist={setlist}
          setlistIndex={setlistIndex}
          run={run}
          flashCheck={flashCheck}
          feedback={feedback}
        />
      </Collapse>
    </div>
  );
}

export interface VjSetlistSectionProps {
  setlists: readonly VjSetlistDTO[];
  state: VjStageState;
  /** The scenes the sheet shows (this pack's, then any pack's), in order. */
  sceneIdsForNewSetlist: readonly string[];
  /** "Set list 3": the next default name no set list holds yet. */
  nextSetlistName: string;
  /** Every scene the library holds, by id: a set list step checks its look. */
  scenesById: ReadonlyMap<string, VjSceneDTO>;
  run: VjRun;
  /** Asks the flash warning first for a look that flashes. */
  requestSceneFlashConsent: VjSceneFlashConsentRequest;
  feedback: VjScenesSheetFeedback;
}

/**
 * The set lists: each one with its scene count and Start set list; the one
 * playing shows its position with Previous scene, Next scene and Stop set
 * list. Starting or stepping onto a scene whose look flashes asks the flash
 * warning first. Make a set list from these scenes posts the sheet's scenes
 * in order.
 */
export function VjSetlistSection({
  setlists,
  state,
  sceneIdsForNewSetlist,
  nextSetlistName,
  scenesById,
  run,
  requestSceneFlashConsent,
  feedback,
}: VjSetlistSectionProps) {
  const { t } = useTranslation();
  const flashCheck: VjSetlistFlashCheck = {
    scenesById,
    requestSceneFlashConsent,
  };
  const headingId = useId();
  const { createSetlist } = useVjSetlistMutations();
  const isMakeHeld =
    createSetlist.isPending || sceneIdsForNewSetlist.length === 0;

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
              <VjSetlistRow
                setlist={setlist}
                isActive={state.activeSetlistId === setlist.id}
                setlistIndex={state.setlistIndex}
                run={run}
                flashCheck={flashCheck}
                feedback={feedback}
              />
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
