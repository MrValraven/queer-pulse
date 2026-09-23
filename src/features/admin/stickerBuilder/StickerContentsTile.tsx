import type { DragEvent } from "react";
import { FiStar } from "react-icons/fi";
import type { AdminStickerResponse } from "../../../shared/contracts/contracts";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StickerTileMenu } from "./StickerTileMenu";
import styles from "./StickerContentsTile.module.css";

export type StickerDropSide = "before" | "after";

/**
 * One sticker in the "In this pack" grid: the art on a checkerboard (so a
 * transparent edge reads as transparent), a Cover badge when it is the pack's
 * cover, its full name under the art, and the kebab menu in the corner.
 *
 * The tile is a native HTML5 drag source and drop target. It only reports
 * which half of itself the pointer is over; the grid owns the order, draws
 * the drop indicator through `dropSide` and commits on drop.
 */
export function StickerContentsTile({
  sticker,
  isCover,
  isFirst,
  isLast,
  isDragging,
  isDragActive,
  isBusy,
  dropSide,
  onDragStart,
  onDragOverSide,
  onDragEnd,
  onSetCover,
  onEdit,
  onMoveEarlier,
  onMoveLater,
  onRemove,
}: {
  sticker: AdminStickerResponse;
  isCover: boolean;
  isFirst: boolean;
  isLast: boolean;
  /** This tile is the one being dragged. */
  isDragging: boolean;
  /** Some tile of this grid is being dragged, so this one accepts a drop. */
  isDragActive: boolean;
  /** A pack save is in flight: dragging and moves wait for it. */
  isBusy: boolean;
  /** Where the drop indicator sits on this tile, or null for none. */
  dropSide: StickerDropSide | null;
  onDragStart: () => void;
  onDragOverSide: (side: StickerDropSide) => void;
  onDragEnd: () => void;
  onSetCover: () => void;
  onEdit: () => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const isDraggable = !isBusy;

  function handleDragStart(event: DragEvent<HTMLLIElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", sticker.id);
    onDragStart();
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>) {
    // Only a tile dragged from this grid can land here: a dropped file or a
    // text selection keeps the browser's "not allowed" cursor.
    if (!isDragActive) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    // Both catalog languages read left to right, so the right half is "after".
    const isRightHalf = event.clientX > bounds.left + bounds.width / 2;
    onDragOverSide(isRightHalf ? "after" : "before");
  }

  return (
    <li
      className={styles.tile}
      data-dragging={isDragging ? "true" : undefined}
      data-drop={dropSide ?? undefined}
      data-draggable={isDraggable ? "true" : undefined}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
    >
      <div className={styles.art}>
        <img
          className={styles.image}
          src={sticker.url}
          alt=""
          width={sticker.width}
          height={sticker.height}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {isCover && (
          <span className={styles.coverBadge}>
            <FiStar aria-hidden fill="currentColor" />
            {t("admin:stickerPacks.contents.coverBadge")}
          </span>
        )}
      </div>
      <p className={styles.label} title={sticker.label}>
        {sticker.label}
      </p>
      <div className={styles.menuSlot}>
        <StickerTileMenu
          stickerLabel={sticker.label}
          isCover={isCover}
          canMoveEarlier={!isFirst}
          canMoveLater={!isLast}
          isBusy={isBusy}
          onSetCover={onSetCover}
          onEdit={onEdit}
          onMoveEarlier={onMoveEarlier}
          onMoveLater={onMoveLater}
          onRemove={onRemove}
        />
      </div>
    </li>
  );
}
