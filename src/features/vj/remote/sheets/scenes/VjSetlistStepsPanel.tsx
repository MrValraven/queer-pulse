import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { FiCamera, FiFilm, FiX } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../../shared/components/ui";
import {
  VJ_LIMITS,
  vjSceneLookOf,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjStageState,
  type VjStepDuration,
} from "../../../../../shared/contracts/vj";
import type { TFunction } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { VjStepDurationPicker } from "../../../library/show/VjStepDurationPicker";
import {
  newVjClipSlot,
  newVjSceneSlot,
  useVjSetlistItemsSender,
  useVjSetlistSettingsSender,
  vjStepDurationTextOf,
  type VjSetlistSlot,
} from "../../../library/show/vjSetlistSlots";
import { vjErrorKeyOf, vjErrorValuesOf } from "../../../vjErrors";
import { VjSheetAlert } from "../../VjSheetAlert";
import { VJ_SETLIST_STEP_GONE_KEYS } from "../../rules/vjSetlistPlayback";
import type { VjSceneMutations } from "./VjSceneRow";
import { VjSetlistStepRow } from "./VjSetlistStepRow";
import styles from "./VjScenesSheet.module.css";

/**
 * "{sequence name} step {n}" for Add live look: counts up from the new
 * step's position until no scene holds the name (compared trimmed,
 * ignoring case). A name over the scene name limit shortens the sequence
 * name, so the step number always stays whole.
 */
function vjLiveLookNameOf(
  setlistName: string,
  firstNumber: number,
  takenNames: readonly string[],
  t: TFunction,
): string {
  const taken = new Set(
    takenNames.map((name) => name.trim().toLocaleLowerCase()),
  );
  const nameFor = (number: number) => {
    const fullName = t("vj:scenes.liveLookStepName", {
      name: setlistName,
      number,
    }).trim();
    const overflow = fullName.length - VJ_LIMITS.sceneNameMax;
    if (overflow <= 0) return fullName;
    const shortName = setlistName
      .slice(0, Math.max(0, setlistName.length - overflow))
      .trimEnd();
    return t("vj:scenes.liveLookStepName", { name: shortName, number })
      .trim()
      .slice(0, VJ_LIMITS.sceneNameMax);
  };
  let number = firstNumber;
  // One more number than there are names is always free.
  while (
    taken.has(nameFor(number).toLocaleLowerCase()) &&
    number <= firstNumber + taken.size
  ) {
    number += 1;
  }
  return nameFor(number);
}

/** A refused steps write, and the scene Add live look saved before the step it was to become was refused. */
interface VjStepsWriteError {
  cause: unknown;
  /** The new scene stays in the library; the line says so. */
  savedSceneName: string | null;
}

interface VjStepsPanelEditsOptions {
  setlist: VjSetlistDTO;
  state: VjStageState;
  scenes: readonly VjSceneDTO[];
  activePackId: string | null;
  createScene: VjSceneMutations["createScene"];
  announce: (line: string) => void;
  stepNameOf: (slot: VjSetlistSlot) => string;
  lengthTextOf: (duration: VjStepDuration | null) => string;
}

/**
 * Every edit of the panel. Step edits go through the library's items
 * sender (one save at a time, the newest waiting list only, rebased onto
 * the ids earlier answers gave new steps), so an edit made while an add
 * saves keeps the added item. Only a list that lands as the newest speaks;
 * the newest list's refusal names its reason. The default length goes
 * through the settings sender, shown ahead of the server while it saves.
 */
function useVjStepsPanelEdits({
  setlist,
  state,
  scenes,
  activePackId,
  createScene,
  announce,
  stepNameOf,
  lengthTextOf,
}: VjStepsPanelEditsOptions) {
  const { t } = useTranslation();
  const items = useVjSetlistItemsSender(setlist);
  const settings = useVjSetlistSettingsSender(setlist);
  const [writeError, setWriteError] = useState<VjStepsWriteError | null>(null);
  // Add live look appends once its scene is saved, onto the newest list then.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });
  useEffect(() => {
    if (settings.isSaved) announce(t("vj:librarySetlists.saved"));
  }, [settings.isSaved, announce, t]);

  const saveSlots = (
    slots: VjSetlistSlot[],
    statusText: () => string,
    savedSceneName: string | null = null,
  ) => {
    setWriteError(null);
    void itemsRef.current.send(slots).then(
      (isNewest) => {
        if (isNewest) announce(statusText());
      },
      (cause: unknown) => setWriteError({ cause, savedSceneName }),
    );
  };
  const appendSlot = (
    newSlot: VjSetlistSlot,
    stepName: string,
    savedSceneName: string | null = null,
  ) => {
    const nextSlots = [...itemsRef.current.baseSlots(), newSlot];
    saveSlots(
      nextSlots,
      () =>
        t("vj:setlistItems.added", {
          step: stepName,
          position: nextSlots.length,
        }),
      savedSceneName,
    );
  };

  const move = (slotIndex: number, direction: -1 | 1) => {
    const slots = items.baseSlots();
    const targetIndex = slotIndex + direction;
    const movedSlot = slots[slotIndex];
    const otherSlot = slots[targetIndex];
    if (movedSlot === undefined || otherSlot === undefined) return;
    slots[targetIndex] = movedSlot;
    slots[slotIndex] = otherSlot;
    saveSlots(slots, () =>
      t("vj:setlistItems.movedStatus", {
        step: stepNameOf(movedSlot),
        position: targetIndex + 1,
      }),
    );
  };
  const remove = (removedSlot: VjSetlistSlot) => {
    const slots = items
      .baseSlots()
      .filter((slot) => slot.key !== removedSlot.key);
    saveSlots(slots, () =>
      t("vj:setlistItems.removed", {
        step: stepNameOf(removedSlot),
        setlist: setlist.name,
      }),
    );
  };
  const changeDuration = (
    changedSlot: VjSetlistSlot,
    duration: VjStepDuration | null,
  ) => {
    const slots = items
      .baseSlots()
      .map((slot) =>
        slot.key === changedSlot.key ? { ...slot, duration } : slot,
      );
    saveSlots(slots, () =>
      t("vj:setlistItems.lengthSaved", {
        step: stepNameOf(changedSlot),
        length: lengthTextOf(duration),
      }),
    );
  };
  const addLiveClip = () => {
    if (state.liveClipId === null) return;
    if (items.baseSlots().length >= VJ_LIMITS.setlistItemsMax) return;
    const liveClipSlot = newVjClipSlot(state.liveClipId);
    appendSlot(liveClipSlot, stepNameOf(liveClipSlot));
  };
  const addLiveLook = () => {
    const stepCount = items.baseSlots().length;
    // No room: no scene is saved for a step that could not be added.
    if (createScene.isPending || stepCount >= VJ_LIMITS.setlistItemsMax) {
      return;
    }
    const name = vjLiveLookNameOf(
      setlist.name,
      stepCount + 1,
      scenes.map((scene) => scene.name),
      t,
    );
    setWriteError(null);
    void createScene
      .mutateAsync({ name, packId: activePackId, look: vjSceneLookOf(state) })
      .then(
        (createdScene) =>
          appendSlot(
            newVjSceneSlot(createdScene.id),
            createdScene.name,
            createdScene.name,
          ),
        (cause: unknown) => setWriteError({ cause, savedSceneName: null }),
      );
  };
  const changeDefaultLength = (duration: VjStepDuration | null) => {
    if (duration !== null) settings.save({ stepDuration: duration });
  };

  return {
    slots: items.visibleSlots,
    shownStepDuration: settings.shownStepDuration,
    writeError,
    settingsError: settings.error,
    move,
    remove,
    changeDuration,
    addLiveClip,
    addLiveLook,
    changeDefaultLength,
  };
}

export interface VjSetlistStepsPanelProps {
  setlist: VjSetlistDTO;
  state: VjStageState;
  /** Every scene the library holds: step names, and the names Add live look must not take. */
  scenes: readonly VjSceneDTO[];
  scenesById: ReadonlyMap<string, VjSceneDTO>;
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** Add live look files its new scene under the active pack, as Save scene does. */
  activePackId: string | null;
  createScene: VjSceneMutations["createScene"];
  announce: (line: string) => void;
  onClose: () => void;
}

/**
 * The steps of one sequence on the remote: its default step length, then
 * each step with Move up, Move down, Remove and its own length, then Add
 * live clip (the clip on screen as a clip step) and Add live look (the look
 * on screen saved as a new scene "{sequence} step {n}", then added). Every
 * change saves the whole list, the same PUT the library page sends.
 */
export function VjSetlistStepsPanel({
  setlist,
  state,
  scenes,
  scenesById,
  clipsById,
  activePackId,
  createScene,
  announce,
  onClose,
}: VjSetlistStepsPanelProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const stepNameOf = (slot: VjSetlistSlot): string => {
    const name =
      slot.kind === "clip"
        ? slot.clipId === null
          ? undefined
          : clipsById.get(slot.clipId)?.title
        : slot.sceneId === null
          ? undefined
          : scenesById.get(slot.sceneId)?.name;
    return name ?? t(VJ_SETLIST_STEP_GONE_KEYS[slot.kind]);
  };
  const edits = useVjStepsPanelEdits({
    setlist,
    state,
    scenes,
    activePackId,
    createScene,
    announce,
    stepNameOf,
    lengthTextOf: (duration) =>
      duration === null
        ? t("vj:setlistItems.lengthDefault", {
            length: vjStepDurationTextOf(setlist.stepDuration, t),
          })
        : vjStepDurationTextOf(duration, t),
  });
  const { slots, writeError } = edits;
  const total = slots.length;
  const isFull = total >= VJ_LIMITS.setlistItemsMax;
  // The step on screen, followed by its item id through moves and removals.
  const currentItemId =
    state.activeSetlistId === setlist.id ? state.setlistPlayback.itemId : null;
  const shownError = writeError?.cause ?? edits.settingsError ?? null;

  return (
    <section
      className={styles.stepsPanel}
      aria-labelledby={headingId}
      data-vj-setlist-steps={setlist.id}
    >
      <h4 id={headingId} className={styles.stepsTitle}>
        {t("vj:scenes.stepsTitle", { name: setlist.name })}
      </h4>
      <Collapse isOpen={total === 0}>
        <p className={styles.empty}>{t("vj:setlistItems.empty")}</p>
      </Collapse>
      <ol
        className={styles.list}
        aria-label={t("vj:setlistItems.listLabel", { name: setlist.name })}
      >
        <AnimatePresence initial={false}>
          {slots.map((slot, slotIndex) => (
            <CollapseListItem key={slot.key}>
              <VjSetlistStepRow
                slot={slot}
                stepName={stepNameOf(slot)}
                setlistName={setlist.name}
                position={slotIndex}
                total={total}
                defaultDuration={edits.shownStepDuration}
                isCurrent={
                  currentItemId !== null && slot.itemId === currentItemId
                }
                onMove={(direction) => edits.move(slotIndex, direction)}
                onRemove={() => edits.remove(slot)}
                onDurationChange={(duration) =>
                  edits.changeDuration(slot, duration)
                }
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ol>
      <VjSheetAlert
        errorKey={shownError == null ? null : vjErrorKeyOf(shownError)}
        values={shownError == null ? undefined : vjErrorValuesOf(shownError)}
      />
      <Collapse isOpen={writeError?.savedSceneName != null}>
        <p className={styles.empty}>
          {t("vj:scenes.liveLookSavedNotAdded", {
            name: writeError?.savedSceneName ?? "",
          })}
        </p>
      </Collapse>
      <VjSetlistStepsAdders
        hasLiveClip={state.liveClipId !== null}
        isFull={isFull}
        isSavingLook={createScene.isPending}
        onAddLiveClip={edits.addLiveClip}
        onAddLiveLook={edits.addLiveLook}
      />
      <VjSetlistStepsSettings
        setlistName={setlist.name}
        stepDuration={edits.shownStepDuration}
        onStepDurationChange={edits.changeDefaultLength}
      />
      <Button
        variant="stage-ghost"
        size="sm"
        className={styles.wideButton}
        onClick={onClose}
      >
        <FiX aria-hidden fill="none" />
        {t("vj:scenes.closeSteps")}
      </Button>
    </section>
  );
}

/**
 * The sequence's own settings, after its steps and apart from them: the
 * default step length under a visible label, inside a group named for the
 * sequence, so it never reads as one more step's length.
 */
function VjSetlistStepsSettings({
  setlistName,
  stepDuration,
  onStepDurationChange,
}: {
  setlistName: string;
  stepDuration: VjStepDuration;
  onStepDurationChange: (duration: VjStepDuration | null) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={styles.stepsSettings}
      data-vj-setlist-settings=""
    >
      <h5 id={headingId} className={styles.stepsSettingsTitle}>
        {t("vj:librarySetlists.settingsLabelNamed", { name: setlistName })}
      </h5>
      <p className={styles.fieldLabel} aria-hidden="true">
        {t("vj:librarySetlists.defaultLength")}
      </p>
      <VjStepDurationPicker
        label={t("vj:librarySetlists.defaultLength")}
        value={stepDuration}
        onChange={onStepDurationChange}
      />
    </div>
  );
}

/**
 * Add live clip and Add live look side by side where they fit, each with
 * its own reason folding open under it when it holds.
 */
function VjSetlistStepsAdders({
  hasLiveClip,
  isFull,
  isSavingLook,
  onAddLiveClip,
  onAddLiveLook,
}: {
  /** A clip is on screen (a generator or black screen holds Add live clip). */
  hasLiveClip: boolean;
  isFull: boolean;
  isSavingLook: boolean;
  onAddLiveClip: () => void;
  onAddLiveLook: () => void;
}) {
  const { t } = useTranslation();
  const noClipReasonId = useId();
  const fullReasonId = useId();
  const isClipHeld = isFull || !hasLiveClip;
  const isNoClipShown = !hasLiveClip && !isFull;
  return (
    <div className={styles.stepsAdders}>
      <Collapse isOpen={isFull}>
        <p id={fullReasonId} className={styles.empty}>
          {t("vj:setlistItems.full")}
        </p>
      </Collapse>
      <div className={styles.stepButtons}>
        <div className={styles.adderCell}>
          <Button
            variant="stage-ghost"
            size="sm"
            aria-disabled={isClipHeld || undefined}
            aria-describedby={
              isFull ? fullReasonId : isNoClipShown ? noClipReasonId : undefined
            }
            onClick={() => {
              if (!isClipHeld) onAddLiveClip();
            }}
          >
            <FiFilm aria-hidden fill="none" />
            {t("vj:scenes.addLiveClip")}
          </Button>
          <Collapse isOpen={isNoClipShown}>
            <p id={noClipReasonId} className={styles.adderReason}>
              {t("vj:scenes.addLiveClipNone")}
            </p>
          </Collapse>
        </div>
        <div className={styles.adderCell}>
          <Button
            variant="stage-ghost"
            size="sm"
            aria-disabled={isFull || isSavingLook || undefined}
            aria-busy={isSavingLook || undefined}
            aria-describedby={isFull ? fullReasonId : undefined}
            onClick={() => {
              if (!isFull && !isSavingLook) onAddLiveLook();
            }}
          >
            <FiCamera aria-hidden fill="none" />
            {t("vj:scenes.addLiveLook")}
          </Button>
        </div>
      </div>
    </div>
  );
}
