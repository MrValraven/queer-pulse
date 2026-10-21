import { useEffect, useMemo, useState, type RefObject } from "react";
import type { ModSeverity } from "../admin/api/moderation.api";
import { hasOpenModal } from "../../shared/components/ui/modalStack";
import { readListeningPreferences } from "./player/studioPlayerPreferences";

export type ReviewSortOrder = "oldest" | "newest" | "severity";

/** Most urgent first, for the severity sort. A card without a severity
 *  (disputes, claims, older rows) sorts after every rated one. */
const SEVERITY_RANK: Record<ModSeverity, number> = {
  emergency: 0,
  high: 1,
  medium: 2,
  low: 3,
};
const UNRATED_RANK = 4;

/** The marker every card title carries, so J and K find the cards of the
 *  open tab in screen order. */
export const REVIEW_CARD_TITLE_ATTRIBUTE = "data-review-card-title";

export interface ReviewQueueFields<Item> {
  createdAtOf: (item: Item) => string;
  /** Present when the queue can sort by severity. */
  severityOf?: (item: Item) => ModSeverity | null | undefined;
  /** Present when the queue can filter: the value each card files under. */
  filterValueOf?: (item: Item) => string;
  /** The order the queue opens in: oldest first for a due-date queue (the
   *  default), newest first for a record such as Withdrawn. */
  initialSortOrder?: ReviewSortOrder;
}

export interface ReviewQueueOrder<Item> {
  sortOrder: ReviewSortOrder;
  setSortOrder: (order: ReviewSortOrder) => void;
  /** "all", or one of `filterValues`. */
  filter: string;
  setFilter: (value: string) => void;
  /** The distinct values the loaded cards file under, in first-seen order. */
  filterValues: string[];
  visibleItems: Item[];
}

const ALL = "all";

function timeOf(iso: string): number {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
}

/** Sort and filter over the cards loaded so far. Oldest first is the
 *  default, since the card that has waited longest is due first. A filter
 *  whose last card leaves falls back to every card. */
export function useReviewQueueOrder<Item>(
  items: Item[],
  fields: ReviewQueueFields<Item>,
): ReviewQueueOrder<Item> {
  const [sortOrder, setSortOrder] = useState<ReviewSortOrder>(
    fields.initialSortOrder ?? "oldest",
  );
  const [chosenFilter, setFilter] = useState(ALL);
  const { createdAtOf, severityOf, filterValueOf } = fields;

  const filterValues = useMemo(() => {
    if (!filterValueOf) return [];
    return [...new Set(items.map(filterValueOf))];
  }, [items, filterValueOf]);
  const filter = filterValues.includes(chosenFilter) ? chosenFilter : ALL;

  const visibleItems = useMemo(() => {
    const filtered =
      filter === ALL || !filterValueOf
        ? items
        : items.filter((item) => filterValueOf(item) === filter);
    const byAge = (left: Item, right: Item) =>
      timeOf(createdAtOf(left)) - timeOf(createdAtOf(right));
    const rankOf = (item: Item) => {
      const severity = severityOf?.(item);
      return severity ? SEVERITY_RANK[severity] : UNRATED_RANK;
    };
    return [...filtered].sort((left, right) => {
      if (sortOrder === "newest") return -byAge(left, right);
      if (sortOrder === "severity")
        return rankOf(left) - rankOf(right) || byAge(left, right);
      return byAge(left, right);
    });
  }, [items, filter, filterValueOf, createdAtOf, severityOf, sortOrder]);

  return {
    sortOrder,
    setSortOrder,
    filter,
    setFilter,
    filterValues,
    visibleItems,
  };
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  // A checkbox or radio takes no letters, so J and K still walk the cards
  // while a card's tick has focus.
  if (
    target instanceof HTMLInputElement &&
    (target.type === "checkbox" || target.type === "radio")
  )
    return false;
  return target.closest("input, textarea, select, [contenteditable]") !== null;
}

/**
 * J moves focus to the next card's title in the open tab, K to the one
 * before, so staff can walk a queue without the pointer. They stand down
 * while a field has focus, while a dialog is open, with a modifier held, or
 * when "Single-key shortcuts" is off in Studio settings. A native listener,
 * since the panel itself is not interactive.
 */
export function useReviewCardKeys(panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key !== "j" && key !== "k") return;
      if (isTypingTarget(event.target) || hasOpenModal()) return;
      if (!readListeningPreferences().areSingleKeyShortcutsOn) return;
      const panel = panelRef.current;
      if (!panel) return;
      const titles = [
        ...panel.querySelectorAll<HTMLElement>(
          `[${REVIEW_CARD_TITLE_ATTRIBUTE}]`,
        ),
      ];
      if (titles.length === 0) return;
      const currentCard = document.activeElement?.closest("article");
      const currentIndex = titles.findIndex(
        (title) => title.closest("article") === currentCard,
      );
      const step = key === "j" ? 1 : -1;
      const nextIndex =
        currentIndex === -1
          ? step === 1
            ? 0
            : titles.length - 1
          : Math.min(Math.max(currentIndex + step, 0), titles.length - 1);
      const target = titles[nextIndex];
      if (!target) return;
      event.preventDefault();
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "nearest" });
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panelRef]);
}
