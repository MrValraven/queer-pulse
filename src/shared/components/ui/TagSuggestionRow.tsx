import { useRef, type Ref, type RefObject } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiGrid, FiPlus } from "react-icons/fi";
import { cx } from "../../lib/cx";
import styles from "./TagPicker.module.css";
import { useChipMotion } from "./useChipMotion";

/**
 * The quick-add row: an optional label, one dashed chip per suggestion, and
 * an optional "Browse all" button at the end. A chip that is added leaves the
 * row and focus moves to the next quick-add, else the previous one, else
 * "Browse all", else the input, so a keyboard user can add several in a row.
 */
export function TagSuggestionRow({
  suggestions,
  label,
  addLabel,
  formatTag,
  browse,
  onAdd,
  fallbackFocusRef,
}: {
  suggestions: readonly string[];
  label?: string;
  addLabel?: (tag: string) => string;
  formatTag: (tag: string) => string;
  browse?: { label: string; onClick: () => void; isExpanded?: boolean };
  onAdd: (tag: string) => void;
  fallbackFocusRef: RefObject<HTMLElement | null>;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLButtonElement>(null);

  function addAt(tag: string, index: number) {
    const quickAdds = Array.from(
      rowRef.current?.querySelectorAll<HTMLButtonElement>("[data-quick-add]") ??
        [],
    );
    const nextFocus =
      quickAdds[index + 1] ??
      quickAdds[index - 1] ??
      browseRef.current ??
      fallbackFocusRef.current;
    onAdd(tag);
    nextFocus?.focus();
  }

  return (
    <m.div
      ref={rowRef}
      layout="position"
      layoutRoot
      className={styles.suggestRow}
    >
      {label && suggestions.length > 0 && (
        <span className={styles.suggestLabel}>{label}</span>
      )}
      <AnimatePresence mode="popLayout" initial={false}>
        {suggestions.map((tag, index) => (
          <QuickAddChip
            key={tag}
            text={formatTag(tag)}
            ariaLabel={addLabel?.(tag)}
            onAdd={() => addAt(tag, index)}
          />
        ))}
      </AnimatePresence>
      {/* Its own AnimatePresence, kept so the button mounts and leaves on its
          own. It has no `layout`: it is last in its row, so a snap to a new
          line is invisible, and a glide across the other chips reads as a
          glitch. */}
      <AnimatePresence initial={false}>
        {browse && (
          <m.button
            key="browse"
            ref={browseRef}
            type="button"
            className={cx(styles.addChip, styles.browseChip)}
            aria-expanded={browse.isExpanded}
            onClick={browse.onClick}
          >
            <FiGrid aria-hidden focusable="false" />
            {browse.label}
          </m.button>
        )}
      </AnimatePresence>
    </m.div>
  );
}

/** One quick-add chip. Leaving, it is hidden and out of the tab order, the
 *  same way a `ChipList` chip is. */
function QuickAddChip({
  text,
  ariaLabel,
  onAdd,
  ref,
}: {
  text: string;
  ariaLabel?: string;
  onAdd: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  const isPresent = useIsPresent();
  const { chip } = useChipMotion();
  return (
    <m.button
      ref={ref}
      type="button"
      className={styles.addChip}
      aria-label={ariaLabel}
      aria-hidden={isPresent ? undefined : true}
      tabIndex={isPresent ? undefined : -1}
      data-quick-add={isPresent ? "" : undefined}
      data-leaving={isPresent ? undefined : ""}
      onClick={onAdd}
      {...chip}
      whileTap={{ scale: 0.95 }}
    >
      <FiPlus aria-hidden focusable="false" />
      {text}
    </m.button>
  );
}
