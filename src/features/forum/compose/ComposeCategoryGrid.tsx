import {
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { FiCompass } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useRovingRadioGroup } from "../../../shared/hooks/useRovingRadioGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getThreads } from "../api/forum.api";
import { THREADS } from "../forum.data";
import { COMPOSE_CATEGORIES } from "./composeCategories.data";
import styles from "./ComposeCategoryGrid.module.css";

// ── "Where does it go?" ─────────────────────────────────────────────────────
// A real `role="radiogroup"`: one tab stop for the whole grid, arrows move
// focus AND selection, Home/End jump to the ends. That keyboard model comes
// from `useRovingRadioGroup`, the same hook `RadioCardGroup` is built on. The
// primitive itself is not used here because each card needs its own hover and
// focus handlers to place the recent-threads popover, and the primitive owns
// the button element.
//
// THE POPOVER IS DECORATIVE. It shows two thread titles already filed under
// the card being pointed at, as a taste of what lives there. Everything a
// member needs to choose a category (its name, its one-line description) is
// printed in the card itself, the popover is `aria-hidden` and
// `pointer-events: none`, and the threads it names are all on the forum. So
// nothing is only reachable by hovering, and there is no focus to trap.

/** How many titles the popover shows per category. */
const RECENT_TITLES_PER_CATEGORY = 2;

/** Width of the popover, in px. Mirrored in the stylesheet; kept here so the
 *  left-edge clamp can keep it inside the grid. */
const POPOVER_WIDTH = 250;

/** Gap between a card's bottom edge and the popover under it, in px. */
const POPOVER_OFFSET = 6;

/** The popover's position plus which category raised it. */
interface CategoryPreview {
  categoryId: string;
  left: number;
  top: number;
}

export interface ComposeCategoryGridProps {
  /** The selected category id, or null before one is chosen. */
  category: string | null;
  /** Files the post under a category. */
  onChange: (category: string) => void;
  /** The category the draft text sounds like, or null. A chip offers it
   *  whenever it differs from the selection. */
  suggestedCategory: string | null;
}

export function ComposeCategoryGrid({
  category,
  onChange,
  suggestedCategory,
}: ComposeCategoryGridProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const hintId = useId();
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<CategoryPreview | null>(null);
  const recentTitles = useCategoryRecentTitles();

  const checkedIndex = COMPOSE_CATEGORIES.findIndex(
    (candidate) => candidate.id === category,
  );
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: COMPOSE_CATEGORIES.length,
    checkedIndex,
    onSelect: (index) => {
      const next = COMPOSE_CATEGORIES[index];
      if (next) onChange(next.id);
    },
  });

  function openPreview(
    event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    categoryId: string,
  ) {
    const card = event.currentTarget;
    const gridWrap = gridWrapRef.current;
    if (!gridWrap) return;
    const rightmost = Math.max(0, gridWrap.clientWidth - POPOVER_WIDTH);
    setPreview({
      categoryId,
      left: Math.min(card.offsetLeft, rightmost),
      top: card.offsetTop + card.offsetHeight + POPOVER_OFFSET,
    });
  }

  const previewCategory = preview
    ? COMPOSE_CATEGORIES.find(
        (candidate) => candidate.id === preview.categoryId,
      )
    : undefined;
  const previewTitles = preview
    ? (recentTitles.get(preview.categoryId) ?? [])
    : [];
  const suggestion =
    suggestedCategory && suggestedCategory !== category
      ? COMPOSE_CATEGORIES.find(
          (candidate) => candidate.id === suggestedCategory,
        )
      : undefined;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          {t("forum:composePage.section.category.title")}
        </h2>
        <p id={hintId} className={styles.hint}>
          {t("forum:composePage.section.category.hint")}
        </p>
        {suggestion && (
          <button
            type="button"
            className={styles.suggestion}
            onClick={() => onChange(suggestion.id)}
          >
            <FiCompass aria-hidden />
            {t("forum:composePage.category.suggestion", {
              category: t(suggestion.nameKey),
            })}
          </button>
        )}
      </div>

      {/* The pointer-leave lives on the wrapper rather than on the
          radiogroup: an element carrying an interactive role and a mouse
          handler has to be focusable, and a radiogroup must never be a tab
          stop of its own (its radios are). */}
      <div
        className={styles.gridWrap}
        ref={gridWrapRef}
        onMouseLeave={() => setPreview(null)}
      >
        <div
          role="radiogroup"
          aria-labelledby={headingId}
          aria-describedby={hintId}
          className={styles.grid}
        >
          {COMPOSE_CATEGORIES.map((option, index) => {
            const CategoryIcon = option.icon;
            const isChecked = option.id === category;
            return (
              <button
                {...getRadioProps(index)}
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isChecked}
                className={`${styles.card} ${
                  option.id === suggestedCategory ? styles.cardSuggested : ""
                }`}
                onClick={() => onChange(option.id)}
                onMouseEnter={(event) => openPreview(event, option.id)}
                onFocus={(event) => openPreview(event, option.id)}
                onBlur={() => setPreview(null)}
              >
                <span className={styles.cardTitle}>
                  <CategoryIcon className={styles.cardIcon} aria-hidden />
                  {t(option.nameKey)}
                </span>
                <span className={styles.cardDescription}>
                  {t(option.descriptionKey)}
                </span>
              </button>
            );
          })}
        </div>
        {preview && previewCategory && previewTitles.length > 0 && (
          <div
            className={styles.popover}
            style={{ left: preview.left, top: preview.top }}
            aria-hidden
          >
            <span className={styles.popoverLabel}>
              {t("forum:composePage.category.recentIn", {
                category: t(previewCategory.nameKey),
              })}
            </span>
            {previewTitles.map((title) => (
              <span key={title} className={styles.popoverTitle}>
                {title}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** A thread reduced to the two fields the popover reads. */
interface RecentThread {
  title: string;
  category: string;
}

/**
 * Two recent titles per category, fetched ONCE for the whole grid.
 *
 * One `new`-sorted page covers every category, so this is a single request
 * rather than one per card on hover. It lives under its own query key, never
 * `["forum-threads", …]`, which the publish mutation invalidates: a decorative
 * popover must not make publishing refetch the forum list behind the composer.
 *
 * Demo mode reads the same `THREADS` corpus the forum list renders, so the
 * prototype still shows real titles with no API.
 */
function useCategoryRecentTitles(): Map<string, string[]> {
  const { demoMode } = useDemoMode();
  const query = useQuery<RecentThread[]>({
    queryKey: ["forum-compose-category-recents", demoMode],
    queryFn: async () => {
      if (demoMode)
        return THREADS.map((thread) => ({
          title: thread.title,
          category: thread.category,
        }));
      const page = await getThreads(undefined, undefined, { sort: "new" });
      return page.data.map((dto) => ({
        title: dto.title,
        category: dto.category,
      }));
    },
  });

  return useMemo(() => {
    const byCategory = new Map<string, string[]>();
    for (const thread of query.data ?? []) {
      const titles = byCategory.get(thread.category) ?? [];
      if (titles.length >= RECENT_TITLES_PER_CATEGORY) continue;
      titles.push(thread.title);
      byCategory.set(thread.category, titles);
    }
    return byCategory;
  }, [query.data]);
}
