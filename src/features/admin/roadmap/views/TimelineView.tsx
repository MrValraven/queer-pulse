import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  FiCheckCircle,
  FiEyeOff,
  FiHeart,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { usePrefersReducedMotion } from "../../../../shared/hooks";
import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import { AdminCat, AdminChip } from "../../ui";
import {
  matchItem,
  sortItems,
  useRoadmapFilters,
} from "../state/useRoadmapFilters";
import { useItemDrawer } from "../state/useItemDrawer";
import { useRoadmapSelection } from "../state/useRoadmapSelection";
import { useRoadmapShortcuts } from "../state/useRoadmapShortcuts";
import {
  CONFIDENCE_TONE,
  COLUMN_STATUS_TONE,
  PRIORITY_TONE,
  TIMELINE_QUARTERS,
  categoryTranslationKey,
  groupByQuarter,
  quarterLabel,
  type TimelineQuarter,
} from "./timeline.data";
import styles from "./TimelineView.module.css";

/**
 * Quarter-by-quarter target-date lanes (Task C5) — a fixed, ordered set of
 * columns (`timeline.data.ts`'s `TIMELINE_QUARTERS`), each a jade
 * shipped-progress meter over a stack of slim, self-contained cards. Filters
 * itself from `useRoadmapFilters()` (the toolbar only renders above
 * Board/Timeline, per `roadmapChrome.data.ts`'s `showsToolbar`) rather than
 * relying on a parent to have already filtered `items`.
 *
 * Deliberately does not import Board's `RoadmapCard` — this card is a
 * smaller, independent read of the same DTO so the two views can't couple
 * to each other's internals. Its selection checkbox mirrors
 * `RoadmapCard`'s a11y pattern instead (own `isInteractiveTarget` guard
 * below), so `BulkBar` — rendered above both Board and Timeline whenever
 * `showsToolbar` is true — has something to select on this tab too.
 *
 * Also mirrors Board's `j`/`k`/`e` focused-card model (`useBoardDnd.ts`) —
 * a `focusedId` walked across the lanes in `TIMELINE_QUARTERS` order (the
 * same order they render left to right), so the shortcuts read the board
 * the way it reads visually. No drag-and-drop here, just focus + edit, so
 * this stays inline rather than its own hook file.
 */
function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest("[data-card-interactive]"));
}

export function TimelineView({ items }: { items: AdminRoadmapItemDTO[] }) {
  const { filters } = useRoadmapFilters();
  const itemDrawer = useItemDrawer();
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const visible = sortItems(
      items.filter((item) => matchItem(item, filters)),
      filters.sort,
    );
    return groupByQuarter(visible);
  }, [items, filters]);

  const flatOrder = useMemo(
    () => TIMELINE_QUARTERS.flatMap((quarter) => columns[quarter]),
    [columns],
  );

  const moveFocus = useCallback(
    (delta: number) => {
      setFocusedId((current) => {
        if (flatOrder.length === 0) return null;
        const currentIndex = current
          ? flatOrder.findIndex((item) => item.id === current)
          : -1;
        const nextIndex =
          currentIndex === -1
            ? 0
            : Math.min(Math.max(currentIndex + delta, 0), flatOrder.length - 1);
        return flatOrder[nextIndex]?.id ?? null;
      });
    },
    [flatOrder],
  );

  useRoadmapShortcuts({
    onFocusNext: () => moveFocus(1),
    onFocusPrev: () => moveFocus(-1),
    onEditFocused: () => {
      if (focusedId) itemDrawer.open(focusedId);
    },
  });

  return (
    <div className={styles.lanes}>
      {TIMELINE_QUARTERS.map((quarter) => (
        <TimelineColumn
          key={quarter}
          quarter={quarter}
          items={columns[quarter]}
          onOpen={itemDrawer.open}
          focusedId={focusedId}
        />
      ))}
    </div>
  );
}

function TimelineColumn({
  quarter,
  items,
  onOpen,
  focusedId,
}: {
  quarter: TimelineQuarter;
  items: AdminRoadmapItemDTO[];
  onOpen: (id: string) => void;
  focusedId: string | null;
}) {
  const { t } = useTranslation();
  const shippedCount = items.filter((item) => item.column === "shipped").length;
  const progressPct =
    items.length > 0 ? Math.round((shippedCount / items.length) * 100) : 0;
  const label = quarterLabel(quarter, t);

  return (
    <section className={styles.column} aria-label={label}>
      <header className={styles.columnHead}>
        <h3 className={styles.columnTitle}>{label}</h3>
        <p className={styles.columnCount}>
          {t("admin:roadmap.timelineView.laneCount", {
            items: items.length,
            shipped: shippedCount,
          })}
        </p>
        <div
          className={styles.meter}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div className={styles.meterFill} style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <div className={styles.cards}>
        {items.length === 0 && (
          <p className={styles.emptyNote}>{t("admin:roadmap.board.emptyColumn")}</p>
        )}
        {items.map((item) => (
          <TimelineCard
            key={item.id}
            item={item}
            onOpen={onOpen}
            focused={focusedId === item.id}
          />
        ))}
      </div>
    </section>
  );
}

function TimelineCard({
  item,
  onOpen,
  focused,
}: {
  item: AdminRoadmapItemDTO;
  onOpen: (id: string) => void;
  focused: boolean;
}) {
  const { t } = useTranslation();
  const selection = useRoadmapSelection();
  const reducedMotion = usePrefersReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const categoryKey = categoryTranslationKey(item.category);
  const openAriaLabel = t("admin:roadmap.board.openCardAriaLabel", {
    name: item.name,
  });
  const selectAriaLabel = t("admin:roadmap.board.selectCardAriaLabel", {
    name: item.name,
  });

  useEffect(() => {
    if (!focused) return;
    cardRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [focused, reducedMotion]);

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) return;
    onOpen(item.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(item.id);
    }
  }

  return (
    <div
      ref={cardRef}
      className={[styles.card, focused && styles.cardFocused].filter(Boolean).join(" ")}
      role="button"
      tabIndex={0}
      aria-label={openAriaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardTopRow}>
        {/* A `<label>` wrapper, not the bare input, carries the enlarged tap
            target (`.cardCheckboxWrap`) — `::before` doesn't render on a
            replaced element like `<input>`, and a label natively forwards a
            click anywhere in its box (including the pseudo-element) to the
            checkbox it wraps. Mirrors `board/RoadmapCard.tsx`. */}
        <label className={styles.cardCheckboxWrap} data-card-interactive>
          <input
            type="checkbox"
            className={styles.cardCheckbox}
            checked={selection.has(item.id)}
            onChange={() => selection.toggle(item.id)}
            aria-label={selectAriaLabel}
          />
        </label>
        <AdminCat tone="coral">{categoryKey ? t(categoryKey) : item.category}</AdminCat>
        <AdminChip tone={PRIORITY_TONE[item.priority]}>{item.priority}</AdminChip>
        <span className={styles.cardFlags} aria-hidden={false}>
          {item.requested && (
            <FiHeart title={t("admin:roadmap.board.flag.requested")} />
          )}
          {item.committed && (
            <FiCheckCircle title={t("admin:roadmap.board.flag.committed")} />
          )}
          {!item.isPublic && (
            <FiEyeOff title={t("admin:roadmap.board.flag.hidden")} />
          )}
          {item.safetyStatus === 1 && (
            <FiShield title={t("admin:roadmap.board.flag.safetyGated")} />
          )}
          {item.spikeFlag && (
            <FiTrendingUp title={t("admin:roadmap.board.flag.spike")} />
          )}
        </span>
      </div>

      <p className={styles.cardTitle}>{item.name}</p>

      <div className={styles.cardBottomRow}>
        <AdminChip tone={COLUMN_STATUS_TONE[item.column]}>
          {t(`admin:roadmap.board.column.${item.column}`)}
        </AdminChip>
        <AdminChip tone={CONFIDENCE_TONE[item.confidence]}>
          {t(`admin:roadmap.drawer.commitment.confidence.${item.confidence}.label`)}
        </AdminChip>
      </div>
    </div>
  );
}
