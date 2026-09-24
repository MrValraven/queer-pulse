import type { PointerEvent as ReactPointerEvent } from "react";
import { m } from "motion/react";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { OwnerSideCard, type PersonaShareTarget } from "./OwnerSideCard";
import type { PersonaDashboardView } from "./usePersonaDashboardView";
import styles from "./MySubprofilesOrder.module.css";

/** Reorder glide, the house values (`EditorItemRow`, `CommunityResourceRow`),
 *  tuned to `--dur-base` / `--ease` so a drag or arrow reflow moves like every
 *  other transition in the app. Instant under reduced motion. */
const LAYOUT_EASE = [0.22, 0.68, 0.16, 1] as const;
const LAYOUT_DURATION = 0.25;

interface GripDragHandlers {
  /** Only `onPointerDown` arms the drag. The move/up lifecycle is owned by
   *  window listeners in `useGridDragReorder`, which is what stops a card
   *  reflowing under the finger from stranding the gesture. */
  onPointerDown: (event: ReactPointerEvent) => void;
}

interface ReorderControlsProps {
  personaName: string;
  position: number;
  total: number;
  gripHandlers: GripDragHandlers;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  /** The pill toolbar above a card. */
  className: string | undefined;
}

/**
 * The Cards view's reorder toolbar: the drag grip, the persona's place in the
 * order, and the Move earlier / Move later buttons. The List view renders the
 * same three things as `RowReorderControls`, shaped for the start of a row.
 *
 * The grip is the pointer path and stays `aria-hidden`; the two buttons are
 * the keyboard and assistive-tech path, the same pairing the section editor
 * uses beside `useRowDragReorder`. Their accessible names carry the persona's
 * own name, so a screen reader moving through a grid of them never hears the
 * same "Move earlier" a dozen times over with nothing to tell them apart.
 *
 * Each button carries `data-move="earlier" | "later"` (in both views), which
 * is how `usePersonaProfileOrder` finds it again to hand keyboard focus back
 * after a move reorders the list.
 */
function ReorderControls({
  personaName,
  position,
  total,
  gripHandlers,
  onMoveEarlier,
  onMoveLater,
  className,
}: ReorderControlsProps) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <span
        className={styles.grip}
        aria-hidden
        title={t("subprofiles:mine.order.dragToReorder")}
        {...gripHandlers}
      >
        <MdDragIndicator size={16} />
      </span>
      <span className={styles.position}>
        {t("subprofiles:mine.order.position", { position, total })}
      </span>
      <button
        type="button"
        className={styles.moveBtn}
        data-move="earlier"
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
        data-move="later"
        onClick={onMoveLater}
        disabled={position >= total}
        aria-label={t("subprofiles:mine.order.moveLater", {
          name: personaName,
        })}
      >
        <FiArrowDown size={15} aria-hidden />
      </button>
    </div>
  );
}

/**
 * The List view's version of the same controls, at the start of a row: a
 * drag grip that strengthens when the row is hovered, the position as a large
 * serif ordinal ("01"), and Move earlier / Move later as a compact stack of
 * chevrons that turns into a pair on a narrow row's bottom bar.
 *
 * The ordinal is decorative; the accessible position stays the full "1 of 5"
 * sentence in visually hidden text. The chevrons are icon-only, so each sits
 * in the shared `Tooltip` showing the same named string as its `aria-label`
 * (Move earlier rises above, Move later drops below, the way each one points).
 */
function RowReorderControls({
  personaName,
  position,
  total,
  gripHandlers,
  onMoveEarlier,
  onMoveLater,
}: Omit<ReorderControlsProps, "className">) {
  const { t } = useTranslation();
  const earlierLabel = t("subprofiles:mine.order.moveEarlier", {
    name: personaName,
  });
  const laterLabel = t("subprofiles:mine.order.moveLater", {
    name: personaName,
  });

  return (
    <div className={styles.reorderInline}>
      <span
        className={styles.rowGrip}
        aria-hidden
        title={t("subprofiles:mine.order.dragToReorder")}
        {...gripHandlers}
      >
        <MdDragIndicator />
      </span>
      <span className={styles.ordinal}>
        <span aria-hidden>{String(position).padStart(2, "0")}</span>
        <span className="visuallyHidden">
          {t("subprofiles:mine.order.position", { position, total })}
        </span>
      </span>
      <div className={styles.moveStack}>
        <Tooltip label={earlierLabel} placement="top">
          <button
            type="button"
            className={styles.moveChevron}
            data-move="earlier"
            onClick={onMoveEarlier}
            disabled={position <= 1}
            aria-label={earlierLabel}
          >
            <FiChevronUp aria-hidden />
          </button>
        </Tooltip>
        <Tooltip label={laterLabel} placement="bottom">
          <button
            type="button"
            className={styles.moveChevron}
            data-move="later"
            onClick={onMoveLater}
            disabled={position >= total}
            aria-label={laterLabel}
          >
            <FiChevronDown aria-hidden />
          </button>
        </Tooltip>
      </div>
    </div>
  );
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
  /** Cards (the default) or the List view's one-row-per-persona layout. */
  layout?: PersonaDashboardView;
}

/**
 * One reorderable persona in the on-profile group, in either dashboard view.
 *
 * In the Cards view the `ReorderControls` sit as a compact pill toolbar above
 * the ordinary `OwnerSideCard`. In the List view `RowReorderControls` go into
 * the row itself, handed to `OwnerSideCard` as `leading` so they render at
 * the row's start.
 *
 * Either way the whole thing is ONE element in the drag container, so
 * `container.children` still lines up index-for-index with the personas being
 * reordered, and that one element carries the picked-up `.dragging` state.
 * It also carries `data-persona-id`, so the focus return after a Move earlier
 * or Move later press can find this persona among its siblings.
 *
 * That element is an `m.div` with `layout`, so every persona glides into its
 * new slot as the order changes under a drag or an arrow press, the house
 * pattern over pointer-capture drag. Two settings keep it clean. `"position"`
 * animates the move alone and leaves size changes unanimated, so the
 * transform is a pure translate (which `useGridDragReorder` takes back off
 * when it measures) and a card's contents never stretch mid-glide. And `layoutDependency` is the
 * persona's position, so only a real reorder glides: switching Cards and List,
 * or the hint appearing above, just lays the personas out afresh.
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
  layout = "cards",
}: ReorderableSideCardProps) {
  const { t } = useTranslation();
  const personaName = view.displayName || t("subprofiles:mine.untitled");
  const isRow = layout === "list";
  const shellClass = isRow ? styles.rowShell : styles.cardShell;
  const { reducedMotion } = useMotionPrefs();

  const controlProps = {
    personaName,
    position,
    total,
    gripHandlers,
    onMoveEarlier,
    onMoveLater,
  };
  const controls = isRow ? (
    <RowReorderControls {...controlProps} />
  ) : (
    <ReorderControls {...controlProps} className={styles.reorderBar} />
  );

  return (
    <m.div
      data-persona-id={view.id}
      className={isDragging ? `${shellClass} ${styles.dragging}` : shellClass}
      layout="position"
      layoutDependency={position}
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: LAYOUT_DURATION, ease: LAYOUT_EASE },
      }}
    >
      {!isRow && controls}
      <OwnerSideCard
        view={view}
        onShare={onShare}
        onDelete={onDelete}
        layout={layout}
        leading={isRow ? controls : undefined}
      />
    </m.div>
  );
}
