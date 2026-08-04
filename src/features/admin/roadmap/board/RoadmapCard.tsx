import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { AdminChip } from "../../ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { usePrefersReducedMotion } from "../../../../shared/hooks";
import type {
  AdminRoadmapItemDTO,
  RoadmapColumn,
  RoadmapPriority,
} from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/useItemDrawer";
import { useRoadmapModals } from "../state/useRoadmapModals";
import { useRoadmapSelection } from "../state/useRoadmapSelection";
import { CardDeleteConfirm } from "./CardDeleteConfirm";
import { CardFlags } from "./CardFlags";
import { CardMenu } from "./CardMenu";
import { CardMeta } from "./CardMeta";
import { CardProgressMeter } from "./CardProgressMeter";
import { getCardAlert } from "./cardAlert";
import { useRoadmapCardActions } from "./useRoadmapCardActions";
import type { CardDragProps } from "./useBoardDnd";
import styles from "./Card.module.css";

const PRIORITY_TONE: Record<RoadmapPriority, "danger" | "amber" | "ghost"> = {
  P0: "danger",
  P1: "amber",
  P2: "ghost",
  P3: "ghost",
};

/** The 9 categories the catalog has a translation for — free-text categories
 *  outside this set render as-is (see `roadmapChrome.data.ts`'s own note). */
const KNOWN_CATEGORY_KEYS = new Set([
  "resources",
  "gatherings",
  "members",
  "safety",
  "content",
  "messaging",
  "community",
  "economy",
  "platform",
]);

interface RoadmapCardProps {
  item: AdminRoadmapItemDTO;
  dense: boolean;
  focused: boolean;
  isDragging: boolean;
  itemsById: Map<string, AdminRoadmapItemDTO>;
  maxSortOrderByColumn: Record<RoadmapColumn, number>;
  dragProps: CardDragProps;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest("[data-card-interactive]"));
}

/**
 * One Board card — a `role="button"` region (mirrors `AdminMemberRows`'
 * clickable-row pattern), so both a click/Enter/Space on the card itself
 * AND the `j`/`k`/`e` board-wide shortcuts (wired in `useBoardDnd`, driving
 * `focused`) open the item drawer. Activating anywhere on an interactive
 * control nested inside it instead — marked `data-card-interactive`:
 * checkbox, grip, kebab, the delete-confirm modal — is left to that
 * control; the card-level handlers bail out for those targets.
 */
export function RoadmapCard({
  item,
  dense,
  focused,
  isDragging,
  itemsById,
  maxSortOrderByColumn,
  dragProps,
}: RoadmapCardProps) {
  const { t } = useTranslation();
  const itemDrawer = useItemDrawer();
  const modals = useRoadmapModals();
  const selection = useRoadmapSelection();
  const reducedMotion = usePrefersReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const actions = useRoadmapCardActions(item, maxSortOrderByColumn);

  useEffect(() => {
    if (!focused) return;
    cardRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [focused, reducedMotion]);

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) return;
    itemDrawer.open(item.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      itemDrawer.open(item.id);
    }
  }

  const alert = getCardAlert(item, itemsById, t);
  const categoryLabel = KNOWN_CATEGORY_KEYS.has(item.category)
    ? t(`admin:roadmap.categories.${item.category}`)
    : item.category;
  const openAriaLabel = t("admin:roadmap.board.openCardAriaLabel", {
    name: item.name,
  });
  const selectAriaLabel = t("admin:roadmap.board.selectCardAriaLabel", {
    name: item.name,
  });

  return (
    <div
      ref={cardRef}
      className={[
        styles.card,
        dense && styles.cardDense,
        focused && styles.cardFocused,
        isDragging && styles.cardDragging,
      ]
        .filter(Boolean)
        .join(" ")}
      role="button"
      tabIndex={0}
      aria-label={openAriaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...dragProps}
    >
      <div className={styles.headRow}>
        {/* A `<label>` wrapper, not the bare input, carries the enlarged tap
            target (Card.module.css `.checkboxWrap`) — `::before` doesn't
            render on a replaced element like `<input>`, and a label
            natively forwards a click anywhere in its box (including the
            pseudo-element) to the checkbox it wraps. */}
        <label className={styles.checkboxWrap} data-card-interactive>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={selection.has(item.id)}
            onChange={() => selection.toggle(item.id)}
            aria-label={selectAriaLabel}
          />
        </label>
        <span
          className={styles.grip}
          aria-hidden
          title={t("admin:roadmap.board.gripAriaLabel")}
        >
          ≡
        </span>
        <AdminChip tone="plum" className={styles.categoryChip}>
          {categoryLabel}
        </AdminChip>
        <AdminChip tone={PRIORITY_TONE[item.priority]} className={styles.priorityChip}>
          {item.priority}
        </AdminChip>
        <CardFlags item={item} />
        <span className={styles.menuSlot} data-card-interactive>
          <CardMenu
            item={item}
            ariaLabel={item.name}
            onMoveTo={actions.moveTo}
            onEdit={() => itemDrawer.open(item.id)}
            onTogglePublic={actions.togglePublic}
            onDuplicate={actions.duplicate}
            onNotifyVoters={() => modals.open("notify", { itemId: item.id })}
            onArchive={actions.archive}
            onDelete={actions.requestDelete}
          />
        </span>
      </div>

      <h4 className={styles.title}>{item.name}</h4>

      <CardProgressMeter item={item} />

      {alert && <p className={styles.alert}>{alert.message}</p>}

      <CardMeta item={item} />

      {actions.confirmingDelete && (
        <span data-card-interactive>
          <CardDeleteConfirm
            onCancel={actions.cancelDelete}
            onConfirm={actions.confirmDelete}
          />
        </span>
      )}
    </div>
  );
}
