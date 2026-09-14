import type { PointerEvent as ReactPointerEvent } from "react";
import { FiArrowDown, FiArrowUp, FiMoreVertical } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { OwnerSideCard, type PersonaShareTarget } from "./OwnerSideCard";
import styles from "./MySubprofilesOrder.module.css";

interface GripDragHandlers {
  /** Only `onPointerDown` arms the drag — the move/up lifecycle is owned by
   *  window listeners in `useGridDragReorder`, which is what stops a card
   *  reflowing under the finger from stranding the gesture. */
  onPointerDown: (event: ReactPointerEvent) => void;
}

interface ReorderableSideCardProps {
  view: SubprofileView;
  /** 1-based place in the on-profile group, as shown to the member. */
  position: number;
  /** How many personas are in the on-profile group. */
  total: number;
  gripHandlers: GripDragHandlers;
  /** True while this is the card being dragged (lifts it over its neighbours). */
  isDragging: boolean;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onShare: (target: PersonaShareTarget) => void;
  onDelete: () => void;
}

/**
 * One reorderable card in the on-profile grid: a compact toolbar carrying the
 * drag grip, the card's place in the order, and the Move earlier / Move later
 * buttons, above the ordinary `OwnerSideCard`.
 *
 * The grip is the pointer path and stays `aria-hidden`; the two buttons are
 * the keyboard and assistive-tech path, the same pairing the section editor
 * uses beside `useRowDragReorder`. Their accessible names carry the persona's
 * own name, so a screen reader moving through a grid of them never hears the
 * same "Move earlier" a dozen times over with nothing to tell them apart.
 *
 * The whole thing is ONE element in the drag container, so `container.children`
 * still lines up index-for-index with the personas being reordered.
 */
export function ReorderableSideCard({
  view,
  position,
  total,
  gripHandlers,
  isDragging,
  onMoveEarlier,
  onMoveLater,
  onShare,
  onDelete,
}: ReorderableSideCardProps) {
  const { t } = useTranslation();
  const personaName = view.displayName || t("subprofiles:mine.untitled");

  return (
    <div
      className={
        isDragging ? `${styles.cardShell} ${styles.dragging}` : styles.cardShell
      }
    >
      <div className={styles.reorderBar}>
        <span
          className={styles.grip}
          aria-hidden
          title={t("subprofiles:mine.order.dragToReorder")}
          {...gripHandlers}
        >
          <FiMoreVertical size={16} />
        </span>
        <span className={styles.position}>
          {t("subprofiles:mine.order.position", { position, total })}
        </span>
        <button
          type="button"
          className={styles.moveBtn}
          onClick={onMoveEarlier}
          disabled={position <= 1}
          aria-label={t("subprofiles:mine.order.moveEarlier", {
            name: personaName,
          })}
        >
          <FiArrowUp size={15} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.moveBtn}
          onClick={onMoveLater}
          disabled={position >= total}
          aria-label={t("subprofiles:mine.order.moveLater", {
            name: personaName,
          })}
        >
          <FiArrowDown size={15} aria-hidden />
        </button>
      </div>

      <OwnerSideCard view={view} onShare={onShare} onDelete={onDelete} />
    </div>
  );
}
