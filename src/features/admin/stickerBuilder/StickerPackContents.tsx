import { useEffect, useRef, useState, type DragEvent } from "react";
import { FiImage, FiMoreVertical, FiMove, FiPlus } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  EmptyState,
} from "../../../shared/components/ui";
import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  StickerContentsTile,
  type StickerDropSide,
} from "./StickerContentsTile";
import { StickerEditDialog } from "./StickerEditDialog";
import styles from "./StickerPackContents.module.css";

interface DropTarget {
  stickerId: string;
  side: StickerDropSide;
}

/** The id list with `sourceId` moved to one side of `targetId`. */
function reorderedIds(
  stickerIds: readonly string[],
  sourceId: string,
  target: DropTarget,
): string[] {
  const withoutSource = stickerIds.filter((id) => id !== sourceId);
  const targetIndex = withoutSource.indexOf(target.stickerId);
  if (targetIndex === -1) return [...stickerIds];
  const insertAt = target.side === "before" ? targetIndex : targetIndex + 1;
  withoutSource.splice(insertAt, 0, sourceId);
  return withoutSource;
}

function isSameOrder(first: readonly string[], second: readonly string[]) {
  return (
    first.length === second.length &&
    first.every((id, index) => id === second[index])
  );
}

/**
 * The pack's sticker order as shown: the server order, or a just-made move
 * while its save is in flight. The server order is the truth again once a
 * save settles (a success has refetched the pack by then, a failure left it
 * as it was), when another pack is selected, or when the pack refetches with
 * no save in flight. Every move is announced to screen readers.
 */
function useStickerPackOrder(
  pack: AdminStickerPackResponse,
  isMutating: boolean,
  onReorder: (stickerIds: string[]) => void,
) {
  const { t } = useTranslation();
  const [optimisticOrder, setOptimisticOrder] = useState<string[] | null>(null);
  const [syncedPack, setSyncedPack] = useState(pack);
  const [wasMutating, setWasMutating] = useState(isMutating);
  const [moveAnnouncement, setMoveAnnouncement] = useState("");
  const announcementFrameRef = useRef(0);

  if (syncedPack !== pack || wasMutating !== isMutating) {
    const hasSettled = wasMutating && !isMutating;
    const hasSwitchedPack = syncedPack.id !== pack.id;
    const hasIdleRefetch = syncedPack !== pack && !isMutating;
    setSyncedPack(pack);
    setWasMutating(isMutating);
    if (hasSettled || hasSwitchedPack || hasIdleRefetch) {
      setOptimisticOrder(null);
    }
  }

  useEffect(
    () => () => window.cancelAnimationFrame(announcementFrameRef.current),
    [],
  );

  const sortedStickers = [...pack.stickers].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  );
  const stickerById = new Map(sortedStickers.map((item) => [item.id, item]));
  const serverOrder = sortedStickers.map((sticker) => sticker.id);
  const orderedIds = optimisticOrder
    ? [
        ...optimisticOrder.filter((id) => stickerById.has(id)),
        ...serverOrder.filter((id) => !optimisticOrder.includes(id)),
      ]
    : serverOrder;
  const orderedStickers = orderedIds.flatMap((id) => {
    const sticker = stickerById.get(id);
    return sticker ? [sticker] : [];
  });

  /** Clears the live region, then writes it on the next frame, so a repeat
   *  of the same move is still announced. */
  function announceMove(sticker: AdminStickerResponse, nextIds: string[]) {
    window.cancelAnimationFrame(announcementFrameRef.current);
    setMoveAnnouncement("");
    announcementFrameRef.current = window.requestAnimationFrame(() => {
      setMoveAnnouncement(
        t("admin:stickerPacks.contents.moved", {
          label: sticker.label,
          position: nextIds.indexOf(sticker.id) + 1,
          total: nextIds.length,
        }),
      );
    });
  }

  /** Moves a sticker next to a target and saves the full order once. A move
   *  waits for the save in flight, and a no-op move saves nothing. */
  function commitMove(sticker: AdminStickerResponse, target: DropTarget) {
    const nextIds = reorderedIds(orderedIds, sticker.id, target);
    if (isMutating || isSameOrder(nextIds, orderedIds)) return;
    setOptimisticOrder(nextIds);
    onReorder(nextIds);
    announceMove(sticker, nextIds);
  }

  return {
    orderedIds,
    orderedStickers,
    stickerById,
    commitMove,
    moveAnnouncement,
    isSavingOrder: optimisticOrder !== null && isMutating,
  };
}

/**
 * The "In this pack" tab: every sticker as a tile, in the order members see
 * them. Reorder by dragging a tile, or from a tile's menu with Move earlier
 * and Move later; either way `onReorder` gets the full id list once, and the
 * new order shows straight away (see `useStickerPackOrder`).
 */
export function StickerPackContents({
  pack,
  onSetCover,
  onRemoveSticker,
  onReorder,
  onUpdateSticker,
  onGoToAddStickers,
  isMutating,
}: {
  pack: AdminStickerPackResponse;
  onSetCover: (stickerId: string) => void;
  onRemoveSticker: (sticker: AdminStickerResponse) => void;
  onReorder: (stickerIds: string[]) => void;
  onUpdateSticker: (
    stickerId: string,
    body: { label: string; keywords: { en: string[]; pt: string[] } },
  ) => Promise<boolean>;
  onGoToAddStickers: () => void;
  isMutating: boolean;
}) {
  const { t } = useTranslation();
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const {
    orderedIds,
    orderedStickers,
    stickerById,
    commitMove,
    moveAnnouncement,
    isSavingOrder,
  } = useStickerPackOrder(pack, isMutating, onReorder);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [stickerToEdit, setStickerToEdit] =
    useState<AdminStickerResponse | null>(null);
  const [stickerToRemove, setStickerToRemove] =
    useState<AdminStickerResponse | null>(null);

  /** Menu path: swap places with the neighbour on one side. */
  function moveOneStep(
    sticker: AdminStickerResponse,
    index: number,
    side: StickerDropSide,
  ) {
    const neighbourId = orderedIds[side === "before" ? index - 1 : index + 1];
    if (neighbourId) commitMove(sticker, { stickerId: neighbourId, side });
  }

  function handleTileDragOver(stickerId: string, side: StickerDropSide) {
    if (dropTarget?.stickerId === stickerId && dropTarget.side === side) return;
    setDropTarget({ stickerId, side });
  }

  function clearDrag() {
    setDraggedId(null);
    setDropTarget(null);
  }

  /** The indicator only shows where a drop would change the order. */
  function dropSideFor(stickerId: string): StickerDropSide | null {
    if (!draggedId || dropTarget?.stickerId !== stickerId) return null;
    const nextIds = reorderedIds(orderedIds, draggedId, dropTarget);
    return isSameOrder(nextIds, orderedIds) ? null : dropTarget.side;
  }

  function handleGridDragOver(event: DragEvent<HTMLUListElement>) {
    if (draggedId) event.preventDefault();
  }

  function handleGridDrop(event: DragEvent<HTMLUListElement>) {
    event.preventDefault();
    const draggedSticker = draggedId ? stickerById.get(draggedId) : undefined;
    if (draggedSticker && dropTarget) commitMove(draggedSticker, dropTarget);
    clearDrag();
  }

  if (orderedStickers.length === 0) {
    return (
      <EmptyState
        icon={<FiImage />}
        title={t("admin:stickerPacks.contents.emptyTitle")}
        description={t("admin:stickerPacks.contents.emptyBody")}
        action={{
          label: t("admin:stickerPacks.contents.addCta"),
          onClick: onGoToAddStickers,
        }}
      />
    );
  }

  return (
    <section className={styles.contents}>
      <div className={styles.toolbar}>
        <p className={styles.hint}>
          {isCoarsePointer ? (
            <FiMoreVertical aria-hidden className={styles.hintIcon} />
          ) : (
            <FiMove aria-hidden className={styles.hintIcon} />
          )}
          {isSavingOrder
            ? t("admin:stickerPacks.contents.savingOrder")
            : isCoarsePointer
              ? t("admin:stickerPacks.contents.hintTouch")
              : t("admin:stickerPacks.contents.hint")}
        </p>
        <Button variant="ghost" size="sm" onClick={onGoToAddStickers}>
          <FiPlus aria-hidden />
          {t("admin:stickerPacks.contents.addCta")}
        </Button>
      </div>
      {!pack.coverStickerId && (
        <p className={styles.coverNudge}>
          {t("admin:stickerPacks.contents.noCover")}
        </p>
      )}
      <ul
        className={styles.grid}
        aria-label={t("admin:stickerPacks.contents.listLabel", {
          name: pack.name,
        })}
        onDragOver={handleGridDragOver}
        onDrop={handleGridDrop}
      >
        {orderedStickers.map((sticker, index) => (
          <StickerContentsTile
            key={sticker.id}
            sticker={sticker}
            isCover={pack.coverStickerId === sticker.id}
            isFirst={index === 0}
            isLast={index === orderedStickers.length - 1}
            isDragging={draggedId === sticker.id}
            isDragActive={draggedId !== null}
            isBusy={isMutating}
            dropSide={dropSideFor(sticker.id)}
            onDragStart={() => setDraggedId(sticker.id)}
            onDragOverSide={(side) => handleTileDragOver(sticker.id, side)}
            onDragEnd={clearDrag}
            onSetCover={() => onSetCover(sticker.id)}
            onEdit={() => setStickerToEdit(sticker)}
            onMoveEarlier={() => moveOneStep(sticker, index, "before")}
            onMoveLater={() => moveOneStep(sticker, index, "after")}
            onRemove={() => setStickerToRemove(sticker)}
          />
        ))}
      </ul>
      <p className="visuallyHidden" aria-live="polite">
        {moveAnnouncement}
      </p>

      {stickerToEdit && (
        <StickerEditDialog
          sticker={stickerToEdit}
          onSave={(body) => onUpdateSticker(stickerToEdit.id, body)}
          onClose={() => setStickerToEdit(null)}
        />
      )}
      <ConfirmDialog
        open={stickerToRemove !== null}
        tone="destructive"
        title={t("admin:stickerPacks.contents.remove.title", {
          label: stickerToRemove?.label ?? "",
        })}
        description={t("admin:stickerPacks.contents.remove.body")}
        confirmLabel={t("admin:stickerPacks.contents.remove.confirm")}
        onClose={() => setStickerToRemove(null)}
        onConfirm={() => {
          if (stickerToRemove) onRemoveSticker(stickerToRemove);
          setStickerToRemove(null);
        }}
      >
        {stickerToRemove?.id === pack.coverStickerId && (
          <p className={styles.removeCoverNote}>
            {t("admin:stickerPacks.contents.remove.coverNote")}
          </p>
        )}
      </ConfirmDialog>
    </section>
  );
}
