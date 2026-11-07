import { useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjSetlistMutations } from "../../api/useVjSetlistMutations";
import { VjReasonLine } from "../../VjReasonLine";
import { vjOrderKeyOf } from "./vjListOrder";
import { useVjListOrder } from "./useVjListOrder";
import { VjSetlistAddScene } from "./VjSetlistAddScene";
import { VjSetlistItemRow } from "./VjSetlistItemRow";
import type { VjSetlistSlot } from "./vjSetlistSlots";
import styles from "./VjSetlists.module.css";

/** Which write the status and reason lines speak for: the last one made. */
type VjItemsWriteSource = "order" | "items";

/** The scene id a slot key names (`sceneId#n`). Scene ids hold no `#`. */
function sceneIdOfSlotKey(slotKey: string): string {
  const markIndex = slotKey.lastIndexOf("#");
  return markIndex < 0 ? slotKey : slotKey.slice(0, markIndex);
}

/** The scene list a save sends for slots in this key order. */
function sceneIdsOfSlotKeys(slotKeys: readonly string[]): string[] {
  return slotKeys.map(sceneIdOfSlotKey);
}

function isSameSceneList(
  firstSceneIds: readonly string[],
  secondSceneIds: readonly string[],
): boolean {
  return (
    firstSceneIds.length === secondSceneIds.length &&
    firstSceneIds.every(
      (sceneId, sceneIndex) => sceneId === secondSceneIds[sceneIndex],
    )
  );
}

/** Slots for a scene list, keyed `sceneId#n` the way `vjSetlistSlotsOf`
 *  keys the saved items, so a row keeps its key while a save is on its way. */
function slotsOfSceneIds(sceneIds: readonly string[]): VjSetlistSlot[] {
  const seenCountBySceneId = new Map<string, number>();
  return sceneIds.map((sceneId) => {
    const occurrence = seenCountBySceneId.get(sceneId) ?? 0;
    seenCountBySceneId.set(sceneId, occurrence + 1);
    return { key: `${sceneId}#${occurrence}`, sceneId };
  });
}

/** The scene list without one slot: removing a scene that plays twice takes
 *  out only the spot the button sat on. */
function sceneIdsWithout(
  sceneIds: readonly string[],
  removedKey: string,
): string[] {
  return slotsOfSceneIds(sceneIds)
    .filter((slot) => slot.key !== removedKey)
    .map((slot) => slot.sceneId);
}

/**
 * The item saves of one set list. Each save sends the whole scene list, so
 * every next list starts from the last list sent: a remove, add or move made
 * before the previous save answers builds on it and keeps it. The list shown
 * is the last one sent until the server list changes with nothing on its way,
 * so the rows answer each click at once. Only the newest save speaks: an
 * older answer resolves `false`, and only the newest refusal rejects (and
 * goes back to the server list).
 */
function useVjSetlistItemsSender(setlist: VjSetlistDTO) {
  const { setSetlistItems } = useVjSetlistMutations();
  const serverSceneIds = useMemo(
    () => setlist.items.map((item) => item.sceneId),
    [setlist.items],
  );
  const serverKey = vjOrderKeyOf(serverSceneIds);
  const [shownSceneIds, setShownSceneIds] = useState<string[] | null>(null);
  const [inFlightCount, setInFlightCount] = useState(0);
  const [seenServerKey, setSeenServerKey] = useState(serverKey);
  const lastSentRef = useRef<string[] | null>(null);
  const inFlightRef = useRef(0);
  const latestSendRef = useRef(0);

  // A new server list with nothing on its way is the truth again.
  if (seenServerKey !== serverKey) {
    setSeenServerKey(serverKey);
    if (inFlightCount === 0) setShownSceneIds(null);
  }

  const visibleSceneIds = shownSceneIds ?? serverSceneIds;
  /** The list the next change builds on: the last one sent while a save is
   *  on its way, else the list shown. */
  const baseSceneIds = (): string[] => [
    ...(lastSentRef.current ?? visibleSceneIds),
  ];

  const send = async (sceneIds: string[]): Promise<boolean> => {
    const sendNumber = latestSendRef.current + 1;
    latestSendRef.current = sendNumber;
    lastSentRef.current = sceneIds;
    inFlightRef.current += 1;
    setShownSceneIds(sceneIds);
    setInFlightCount((count) => count + 1);
    try {
      await setSetlistItems.mutateAsync({ setlistId: setlist.id, sceneIds });
      return latestSendRef.current === sendNumber;
    } catch (cause) {
      if (latestSendRef.current !== sendNumber) return false;
      lastSentRef.current = null;
      setShownSceneIds(null);
      throw cause;
    } finally {
      inFlightRef.current -= 1;
      if (inFlightRef.current === 0) lastSentRef.current = null;
      setInFlightCount((count) => count - 1);
    }
  };

  return {
    visibleSceneIds,
    baseSceneIds,
    send,
    isPending: setSetlistItems.isPending,
  };
}

/**
 * The scenes of one set list, in play order. Every change (a move, an add, a
 * removal) saves the whole list at once. Rows are keyed by slot (`sceneId#n`)
 * because the server makes new item ids on every save, so a save leaves the
 * rows in place. The status and reason lines speak for the last write.
 */
export function VjSetlistItemsEditor({
  setlist,
  scenes,
  clipsById,
}: {
  setlist: VjSetlistDTO;
  scenes: readonly VjSceneDTO[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
}) {
  const { t } = useTranslation();
  const { visibleSceneIds, baseSceneIds, send, isPending } =
    useVjSetlistItemsSender(setlist);
  const slots = useMemo(
    () => slotsOfSceneIds(visibleSceneIds),
    [visibleSceneIds],
  );
  const sceneById = useMemo(
    () => new Map(scenes.map((scene) => [scene.id, scene])),
    [scenes],
  );
  const sceneNameOf = (sceneId: string) =>
    sceneById.get(sceneId)?.name ?? t("vj:setlistItems.sceneGone");

  const {
    orderedItems,
    moveBy,
    draggingIndex,
    gripHandlers,
    listRef,
    status: orderStatus,
    error: orderError,
  } = useVjListOrder<VjSetlistSlot>({
    items: slots,
    idOf: (slot) => slot.key,
    save: (slotKeys) => {
      const sceneIds = sceneIdsOfSlotKeys(slotKeys);
      // Swapping two spots of the same scene changes nothing to save.
      if (isSameSceneList(sceneIds, baseSceneIds())) return Promise.resolve();
      return send(sceneIds);
    },
    statusOf: (movedSlot, newIndex) =>
      t("vj:setlistItems.movedStatus", {
        scene: sceneNameOf(movedSlot.sceneId),
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

  const saveItems = async (sceneIds: string[], statusText: () => string) => {
    setWriteSource("items");
    setItemsError(null);
    try {
      const isNewest = await send(sceneIds);
      if (isNewest) setItemsStatus(statusText());
    } catch (cause) {
      setItemsStatus(null);
      setItemsError(cause);
    }
  };

  const add = (sceneId: string) => {
    const currentSceneIds = baseSceneIds();
    if (currentSceneIds.length >= VJ_LIMITS.setlistItemsMax) return;
    const sceneIds = [...currentSceneIds, sceneId];
    void saveItems(sceneIds, () =>
      t("vj:setlistItems.added", {
        scene: sceneNameOf(sceneId),
        position: sceneIds.length,
      }),
    );
  };

  const remove = (removedSlot: VjSetlistSlot) => {
    void saveItems(sceneIdsWithout(baseSceneIds(), removedSlot.key), () =>
      t("vj:setlistItems.removed", {
        scene: sceneNameOf(removedSlot.sceneId),
        setlist: setlist.name,
      }),
    );
  };

  const status = writeSource === "order" ? orderStatus : itemsStatus;
  const error = writeSource === "order" ? orderError : itemsError;
  const hasScenes = scenes.length > 0;

  return (
    <div className={styles.editor}>
      {/* An empty set list says so in its note below, so the count folds
          away; while it folds it keeps reading 1, the count it last showed. */}
      <Collapse isOpen={total > 0}>
        <p className={styles.itemsCount}>
          {t("vj:setlistItems.count", {
            count: Math.max(total, 1),
            max: VJ_LIMITS.setlistItemsMax,
          })}
        </p>
      </Collapse>
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
              scene={sceneById.get(slot.sceneId)}
              setlistName={setlist.name}
              clipsById={clipsById}
              position={slotIndex}
              total={total}
              isDragging={draggingIndex === slotIndex}
              gripProps={gripHandlers(slotIndex)}
              onMove={(direction) => moveBy(slotIndex, direction)}
              onRemove={() => remove(slot)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <Collapse isOpen={total === 0 && hasScenes}>
        <p className={styles.note}>{t("vj:setlistItems.empty")}</p>
      </Collapse>
      <Collapse isOpen={isFull}>
        <p className={styles.note}>{t("vj:setlistItems.full")}</p>
      </Collapse>
      <p role="status" className="visuallyHidden">
        {status ?? ""}
      </p>
      <VjReasonLine error={error} />
      <Collapse isOpen={!hasScenes}>
        <p className={styles.note}>{t("vj:setlistItems.noScenes")}</p>
      </Collapse>
      <Collapse isOpen={hasScenes}>
        <VjSetlistAddScene
          scenes={scenes}
          isFull={isFull}
          isPending={isPending}
          onAdd={add}
        />
      </Collapse>
    </div>
  );
}
