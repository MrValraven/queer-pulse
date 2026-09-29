import {
  useLayoutEffect,
  useRef,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./ActiveFilters.module.css";
import { Collapse } from "./Collapse";
import { useChipMotion } from "./useChipMotion";

/** One narrowing currently in force, as its own removable chip. */
export interface ActiveFilter {
  /** Stable react key. */
  key: string;
  /** Chip label (a category, a tag name, a quoted search term). */
  label: ReactNode;
  /** Remove just this one. */
  onRemove: () => void;
}

/**
 * What is currently narrowing a list, as removable chips plus a Clear all.
 *
 * This is the answer to "what is on right now?" when the filters live behind a
 * `RefineToggle`, which is most of the time: the drawer holds the controls,
 * this row holds their state, and it stays on screen whether the drawer is open
 * or closed. Give it EVERY narrowing, the search term included, so nothing
 * shaping the results can be invisible.
 *
 * `trailing` rides at the end of the row, before "Clear all". It exists for
 * the result count on pages that have no separate results line: once the count
 * only differs from the total while something is narrowing, this row is the
 * only place it needs to appear.
 *
 * The row grows in when the first filter goes on and folds away (fading, with
 * its top margin) when the last one comes off, still showing the chips it had
 * so the content below glides up. A page that loads with filters already on
 * shows the row at once. Keep this mounted and let an empty `filters` hide
 * it: a conditional mount around it cuts the fold short.
 *
 * A removed chip pops out and the rest of the row glides over; focus moves to
 * the next chip, else the previous one, else "Clear all". When the row
 * empties, focus inside it is dropped to the page and the caller decides
 * where it goes next.
 */
export function ActiveFilters({
  filters,
  onClearFilters,
  trailing,
  className,
}: {
  filters: ActiveFilter[];
  onClearFilters: () => void;
  trailing?: ReactNode;
  className?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isShown = filters.length > 0;

  // The folding row is inert, and a button focused inside it would hold
  // focus on something that can no longer be used. It is blurred right after
  // the commit that empties the row, so a caller watching for a stranded
  // focus (the magazine desk's filter trigger) sees it on the page at once.
  useLayoutEffect(() => {
    if (isShown) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && rowRef.current?.contains(focused)) {
      focused.blur();
    }
  }, [isShown]);

  return (
    <Collapse isOpen={isShown}>
      <ActiveFiltersRow
        rowRef={rowRef}
        filters={filters}
        onClearFilters={onClearFilters}
        trailing={trailing}
        className={className}
      />
    </Collapse>
  );
}

/**
 * The chip row itself. It is a `layoutRoot` (with `layout` beside it, which a
 * root needs to be measured), so the chips glide within the row. The row's
 * own position change is instant: it usually sits under a Refine drawer that
 * eases its own height, and a second glide on the row would fight that one.
 */
function ActiveFiltersRow({
  rowRef,
  filters,
  onClearFilters,
  trailing,
  className,
}: {
  rowRef: RefObject<HTMLDivElement | null>;
  filters: ActiveFilter[];
  onClearFilters: () => void;
  trailing?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  const clearAllRef = useRef<HTMLButtonElement>(null);
  const { transition } = useChipMotion();
  const glide = { layout: "position" as const, transition };

  function removeAt(filter: ActiveFilter, index: number) {
    const removeButtons = Array.from(
      rowRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-filter-remove]",
      ) ?? [],
    );
    const nextFocus =
      removeButtons[index + 1] ??
      removeButtons[index - 1] ??
      clearAllRef.current;
    filter.onRemove();
    nextFocus?.focus();
  }

  return (
    <m.div
      ref={rowRef}
      layout="position"
      layoutRoot
      transition={{ duration: 0 }}
      className={[styles.row, className].filter(Boolean).join(" ")}
    >
      <m.span className={styles.label} {...glide}>
        {t("shared:filters.activeLabel")}
      </m.span>
      <AnimatePresence mode="popLayout" initial={false}>
        {filters.map((filter, index) => (
          <ActiveFilterChip
            key={filter.key}
            label={filter.label}
            removeLabel={t("shared:filters.remove")}
            onRemove={() => removeAt(filter, index)}
          />
        ))}
        {trailing != null && (
          <m.span
            key="active-filters-trailing"
            className={styles.trailing}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...glide}
          >
            {trailing}
          </m.span>
        )}
      </AnimatePresence>
      <m.button
        ref={clearAllRef}
        type="button"
        className={styles.clearAll}
        onClick={onClearFilters}
        {...glide}
      >
        {t("shared:filters.clearAll")}
      </m.button>
    </m.div>
  );
}

/** One removable chip. On its way out it is hidden from assistive tech,
 *  drops out of the tab order, ignores the pointer, and drops
 *  `data-filter-remove` so the row's focus search counts only chips that
 *  stay. `ref` is the one AnimatePresence uses to measure the chip before
 *  lifting it out of the flow. */
function ActiveFilterChip({
  label,
  removeLabel,
  onRemove,
  ref,
}: {
  label: ReactNode;
  removeLabel: string;
  onRemove: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  const isPresent = useIsPresent();
  const { chip } = useChipMotion();
  return (
    <m.button
      ref={ref}
      type="button"
      className={styles.chip}
      aria-hidden={isPresent ? undefined : true}
      tabIndex={isPresent ? undefined : -1}
      data-filter-remove={isPresent ? "" : undefined}
      data-leaving={isPresent ? undefined : ""}
      onClick={isPresent ? onRemove : undefined}
      {...chip}
    >
      {label}
      <FiX aria-hidden />
      <span className={styles.srOnly}>{removeLabel}</span>
    </m.button>
  );
}
