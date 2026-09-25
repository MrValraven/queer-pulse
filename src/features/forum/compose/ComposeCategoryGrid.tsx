import {
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
} from "react";
import { useRovingRadioGroup } from "../../../shared/hooks/useRovingRadioGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COMPOSE_CATEGORIES } from "./composeCategories.data";
import { ComposeCategoryHead } from "./ComposeCategoryHead";
import { ComposeCategoryPopover } from "./ComposeCategoryPopover";
import { measurePopoverPosition } from "./composePopoverPosition";
import { useCategoryRecentTitles } from "./useComposeCategoryRecents";
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
    const gridWrap = gridWrapRef.current;
    if (!gridWrap) return;
    setPreview({
      categoryId,
      ...measurePopoverPosition(event.currentTarget, gridWrap),
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
      <ComposeCategoryHead
        headingId={headingId}
        hintId={hintId}
        suggestion={suggestion}
        onChoose={onChange}
      />

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
        <ComposeCategoryPopover
          placement={
            preview && previewCategory && previewTitles.length > 0
              ? {
                  left: preview.left,
                  top: preview.top,
                  categoryName: t(previewCategory.nameKey),
                  titles: previewTitles,
                }
              : null
          }
        />
      </div>
    </section>
  );
}
