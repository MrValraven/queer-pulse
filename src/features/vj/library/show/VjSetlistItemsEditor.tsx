import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjStepDuration,
  type VjTempo,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjReasonLine } from "../../VjReasonLine";
import { useVjListOrder } from "./useVjListOrder";
import { VjSetlistAddClip } from "./VjSetlistAddClip";
import { VjSetlistAddScene } from "./VjSetlistAddScene";
import { VjSetlistItemRow } from "./VjSetlistItemRow";
import {
  newVjClipSlot,
  newVjSceneSlot,
  vjSetlistRunTimeOf,
  vjSetlistRunTimeTextOf,
  vjStepDurationTextOf,
  type VjSetlistItemsSender,
  type VjSetlistSlot,
} from "./vjSetlistSlots";
import styles from "./VjSetlists.module.css";

/** Which write the status and reason lines speak for: the last one made. */
type VjItemsWriteSource = "order" | "items";

export interface VjSetlistItemsEditorProps {
  setlist: VjSetlistDTO;
  /** The step saves, kept by the row so its step count reads them too. */
  sender: VjSetlistItemsSender;
  /** The default step length as sent while a settings save runs, else as
   *  saved: what a step on its default length plays. */
  stepDuration: VjStepDuration;
  scenes: readonly VjSceneDTO[];
  /** The library's clips, newest first: the Add clip choices. */
  clips: readonly VjClipDTO[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** The live tempo, for the run time of a sequence with steps in beats;
   *  null when no tempo is known, which leaves that run time out. */
  tempo: VjTempo | null;
}

/**
 * The steps of one sequence, in play order. Every change (a move, an add, a
 * removal, a length) saves the whole list at once through the row's sender,
 * so a reorder sends the item ids in their new places. Rows are keyed by slot:
 * the item id of a loaded step, a `new:` key for one not saved yet, so a
 * save leaves the rows in place. The status and reason lines speak for the
 * last write.
 */
export function VjSetlistItemsEditor({
  setlist,
  sender,
  stepDuration,
  scenes,
  clips,
  clipsById,
  tempo,
}: VjSetlistItemsEditorProps) {
  const { t } = useTranslation();
  const { visibleSlots, baseSlots, send, isPending } = sender;
  const sceneById = useMemo(
    () => new Map(scenes.map((scene) => [scene.id, scene])),
    [scenes],
  );
  const stepNameOf = (slot: VjSetlistSlot): string =>
    slot.kind === "clip"
      ? ((slot.clipId === null ? undefined : clipsById.get(slot.clipId))
          ?.title ?? t("vj:setlistItems.clipGone"))
      : ((slot.sceneId === null ? undefined : sceneById.get(slot.sceneId))
          ?.name ?? t("vj:setlistItems.sceneGone"));

  const {
    orderedItems,
    moveBy,
    draggingIndex,
    gripHandlers,
    listRef,
    status: orderStatus,
    error: orderError,
  } = useVjListOrder<VjSetlistSlot>({
    items: visibleSlots,
    idOf: (slot) => slot.key,
    save: (slotKeys) => {
      const currentSlots = baseSlots();
      const slotByKey = new Map(currentSlots.map((slot) => [slot.key, slot]));
      const orderedSlots = slotKeys.flatMap((slotKey) => {
        const slot = slotByKey.get(slotKey);
        return slot === undefined ? [] : [slot];
      });
      // Every new order goes out, even a swap of two steps that play the
      // same thing: the ids travel with the body and the server rewrites
      // the positions.
      return send(orderedSlots);
    },
    statusOf: (movedSlot, newIndex) =>
      t("vj:setlistItems.movedStatus", {
        step: stepNameOf(movedSlot),
        position: newIndex + 1,
      }),
  });

  const [writeSource, setWriteSource] = useState<VjItemsWriteSource>("order");
  const [itemsStatus, setItemsStatus] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<unknown>(null);
  // A new order status or refusal makes the order the last write.
  const [seenOrderSignal, setSeenOrderSignal] = useState({
    status: orderStatus,
    error: orderError,
  });
  if (
    seenOrderSignal.status !== orderStatus ||
    seenOrderSignal.error !== orderError
  ) {
    setSeenOrderSignal({ status: orderStatus, error: orderError });
    if (orderStatus !== null || orderError != null) setWriteSource("order");
  }

  const total = orderedItems.length;
  const isFull = total >= VJ_LIMITS.setlistItemsMax;

  const saveItems = async (
    slots: VjSetlistSlot[],
    statusText: () => string,
  ) => {
    setWriteSource("items");
    setItemsError(null);
    try {
      const isNewest = await send(slots);
      if (isNewest) setItemsStatus(statusText());
    } catch (cause) {
      setItemsStatus(null);
      setItemsError(cause);
    }
  };

  const add = (newSlot: VjSetlistSlot) => {
    const currentSlots = baseSlots();
    if (currentSlots.length >= VJ_LIMITS.setlistItemsMax) return;
    const nextSlots = [...currentSlots, newSlot];
    void saveItems(nextSlots, () =>
      t("vj:setlistItems.added", {
        step: stepNameOf(newSlot),
        position: nextSlots.length,
      }),
    );
  };

  const remove = (removedSlot: VjSetlistSlot) => {
    const nextSlots = baseSlots().filter(
      (slot) => slot.key !== removedSlot.key,
    );
    void saveItems(nextSlots, () =>
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
    const currentSlots = baseSlots();
    if (!currentSlots.some((slot) => slot.key === changedSlot.key)) return;
    void saveItems(
      currentSlots.map((slot) =>
        slot.key === changedSlot.key ? { ...slot, duration } : slot,
      ),
      () =>
        t("vj:setlistItems.lengthSaved", {
          step: stepNameOf(changedSlot),
          length:
            duration === null
              ? t("vj:setlistItems.lengthDefault", {
                  length: vjStepDurationTextOf(stepDuration, t),
                })
              : vjStepDurationTextOf(duration, t),
        }),
    );
  };

  const status = writeSource === "order" ? orderStatus : itemsStatus;
  const error = writeSource === "order" ? orderError : itemsError;

  return (
    <div className={styles.editor}>
      <VjSetlistItemsMeta
        slots={orderedItems}
        stepDuration={stepDuration}
        tempo={tempo}
      />
      <ol
        ref={listRef}
        className={styles.list}
        aria-label={t("vj:setlistItems.listLabel", { name: setlist.name })}
      >
        <AnimatePresence initial={false}>
          {orderedItems.map((slot, slotIndex) => (
            <VjSetlistItemRow
              key={slot.key}
              slot={slot}
              scene={
                slot.sceneId === null ? undefined : sceneById.get(slot.sceneId)
              }
              clip={
                slot.clipId === null ? undefined : clipsById.get(slot.clipId)
              }
              stepName={stepNameOf(slot)}
              setlistName={setlist.name}
              clipsById={clipsById}
              defaultDuration={stepDuration}
              position={slotIndex}
              total={total}
              isDragging={draggingIndex === slotIndex}
              gripProps={gripHandlers(slotIndex)}
              onMove={(direction) => moveBy(slotIndex, direction)}
              onRemove={() => remove(slot)}
              onDurationChange={(duration) => changeDuration(slot, duration)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <p role="status" className="visuallyHidden">
        {status ?? ""}
      </p>
      <VjReasonLine error={error} />
      <VjSetlistItemsAdders
        total={total}
        scenes={scenes}
        clips={clips}
        isFull={isFull}
        isPending={isPending}
        onAddScene={(sceneId) => add(newVjSceneSlot(sceneId))}
        onAddClip={(clipId) => add(newVjClipSlot(clipId))}
      />
    </div>
  );
}

/** The step count and, when it can be told, the run time. An empty sequence
 *  says so in its note below, so the count folds away; while it folds it
 *  keeps reading 1, the count it last showed. The run time folds the same
 *  way and keeps its last words while it folds. */
function VjSetlistItemsMeta({
  slots,
  stepDuration,
  tempo,
}: {
  slots: readonly VjSetlistSlot[];
  stepDuration: VjStepDuration;
  tempo: VjTempo | null;
}) {
  const { t } = useTranslation();
  const total = slots.length;
  const runTime = vjSetlistRunTimeOf(slots, stepDuration, tempo);
  const runTimeText =
    runTime === null ? null : vjSetlistRunTimeTextOf(runTime, t);
  const [lastRunTimeText, setLastRunTimeText] = useState(runTimeText);
  if (runTimeText !== null && runTimeText !== lastRunTimeText) {
    setLastRunTimeText(runTimeText);
  }

  return (
    <Collapse isOpen={total > 0}>
      <div className={styles.itemsCount}>
        <span>
          {t("vj:setlistItems.count", {
            count: Math.max(total, 1),
            max: VJ_LIMITS.setlistItemsMax,
          })}
        </span>
        <Collapse isOpen={runTimeText !== null}>
          <span>{runTimeText ?? lastRunTimeText}</span>
        </Collapse>
      </div>
    </Collapse>
  );
}

/** The notes under the steps and the two add rows, Add scene and Add clip
 *  side by side where they fit.
 *  Each folds away while the library has nothing of its kind. */
function VjSetlistItemsAdders({
  total,
  scenes,
  clips,
  isFull,
  isPending,
  onAddScene,
  onAddClip,
}: {
  total: number;
  scenes: readonly VjSceneDTO[];
  clips: readonly VjClipDTO[];
  isFull: boolean;
  isPending: boolean;
  onAddScene: (sceneId: string) => void;
  onAddClip: (clipId: string) => void;
}) {
  const { t } = useTranslation();
  const hasScenes = scenes.length > 0;
  const hasClips = clips.length > 0;

  return (
    <>
      <Collapse isOpen={total === 0 && (hasScenes || hasClips)}>
        <p className={styles.note}>{t("vj:setlistItems.empty")}</p>
      </Collapse>
      <Collapse isOpen={isFull}>
        <p className={styles.note}>{t("vj:setlistItems.full")}</p>
      </Collapse>
      <Collapse isOpen={!hasClips}>
        <p className={styles.note}>{t("vj:setlistItems.noClips")}</p>
      </Collapse>
      <Collapse isOpen={!hasScenes}>
        <p className={styles.note}>{t("vj:setlistItems.noScenes")}</p>
      </Collapse>
      <div className={styles.adders}>
        <Collapse isOpen={hasScenes}>
          <VjSetlistAddScene
            scenes={scenes}
            isFull={isFull}
            isPending={isPending}
            onAdd={onAddScene}
          />
        </Collapse>
        <Collapse isOpen={hasClips}>
          <VjSetlistAddClip
            clips={clips}
            isFull={isFull}
            isPending={isPending}
            onAdd={onAddClip}
          />
        </Collapse>
      </div>
    </>
  );
}
