import { useEffect, useId, useRef, type Ref } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { cx } from "../../lib/cx";
import styles from "./TagPicker.module.css";
import type { TagPickerLabels } from "./TagPicker";
import { useChipMotion } from "./useChipMotion";
import type { TagEntry } from "./useTagEntry";

/**
 * The entry input and, in closed mode, its listbox. The wrapper glides with
 * the chips (`layout="position"`), and the listbox hangs under the input.
 * Options stay out of the tab order: the input keeps focus and points at the
 * highlighted one with `aria-activedescendant`. The list scrolls itself, and
 * the page or modal body around it, just enough to show what is highlighted.
 * `ref` is the root, which a `popLayout` AnimatePresence measures.
 */
export function TagPickerEntry({
  entry,
  isClosed,
  isBoxed,
  inputRef,
  describedBy,
  formatTag,
  labels,
  ref,
}: {
  entry: TagEntry;
  isClosed: boolean;
  isBoxed: boolean;
  inputRef: Ref<HTMLInputElement>;
  describedBy?: string;
  formatTag: (tag: string) => string;
  labels: TagPickerLabels;
  ref?: Ref<HTMLDivElement>;
}) {
  const listId = useId();
  const listboxRef = useRef<HTMLDivElement>(null);
  const { transition } = useChipMotion();
  const isPresent = useIsPresent();
  const optionId = (index: number) => `${listId}-option-${index}`;
  const hasMatches = entry.matches.length > 0;
  const isListShown = entry.isListOpen && hasMatches;
  const isNoMatchShown =
    entry.isListOpen && !hasMatches && Boolean(labels.noMatch);
  const activeOption =
    isListShown && entry.highlight > -1 ? optionId(entry.highlight) : undefined;
  const popoverMotion = {
    initial: { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0 },
    exit: "leave",
    // `custom` from the AnimatePresence below: a pick closes the list at
    // once, so it does not fade over the quick-add row.
    variants: {
      leave: (hasJustPicked: boolean) =>
        hasJustPicked
          ? { opacity: 0, transition: { duration: 0 } }
          : { opacity: 0, y: -4 },
    },
    transition: { duration: transition.duration === 0 ? 0 : 0.15 },
  };

  // An instant scroll (no smooth behaviour, so reduced motion holds) that
  // shows the whole list inside a scrolling modal body or above the fold.
  useEffect(() => {
    if (isListShown) {
      listboxRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [isListShown]);

  // Arrow keys move the highlight; keep it visible inside the capped list.
  useEffect(() => {
    if (activeOption) {
      document
        .getElementById(activeOption)
        ?.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
  }, [activeOption]);

  return (
    <m.div
      ref={ref}
      layout="position"
      transition={transition}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cx(styles.entry, isBoxed && styles.entryBoxed)}
    >
      <input
        ref={inputRef}
        type="text"
        className={isBoxed ? styles.boxInput : styles.inlineInput}
        value={entry.draft}
        role={isClosed ? "combobox" : undefined}
        aria-expanded={isClosed ? isListShown : undefined}
        aria-autocomplete={isClosed ? "list" : undefined}
        aria-controls={isClosed && isListShown ? listId : undefined}
        aria-activedescendant={activeOption}
        aria-label={labels.input}
        aria-describedby={describedBy}
        placeholder={labels.placeholder}
        autoComplete="off"
        onChange={(event) => entry.onChange(event.target.value)}
        onKeyDown={entry.onKeyDown}
        onFocus={entry.onFocus}
        onBlur={() => entry.onBlur(!isPresent)}
      />
      {/* Always mounted, so a screen reader has already registered the live
          region by the time it gets text: inserting a role="status" node
          together with its content is exactly what many screen readers skip.
          The visible popover below stays aria-hidden so its own text is not
          announced a second time. */}
      <span className="visuallyHidden" role="status" aria-live="polite">
        {isNoMatchShown ? labels.noMatch?.(entry.draft.trim()) : ""}
      </span>
      <AnimatePresence custom={entry.hasJustPicked}>
        {isListShown && (
          <m.div
            key="list"
            ref={listboxRef}
            id={listId}
            role="listbox"
            aria-label={labels.input}
            className={styles.listbox}
            {...popoverMotion}
          >
            {entry.matches.map((option, index) => (
              <button
                key={option}
                id={optionId(index)}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={index === entry.highlight}
                className={cx(
                  styles.option,
                  index === entry.highlight && styles.optionActive,
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => entry.pick(option)}
              >
                <FiPlus aria-hidden focusable="false" />
                {formatTag(option)}
              </button>
            ))}
          </m.div>
        )}
        {isNoMatchShown && (
          <m.p
            key="no-match"
            aria-hidden="true"
            className={styles.noMatchBox}
            {...popoverMotion}
          >
            {labels.noMatch?.(entry.draft.trim())}
          </m.p>
        )}
      </AnimatePresence>
    </m.div>
  );
}
