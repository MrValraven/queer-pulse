import { useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { cx } from "../../lib/cx";
import { ChipList } from "./ChipList";
import { Collapse } from "./Collapse";
import styles from "./TagPicker.module.css";
import { TagPickerEntry } from "./TagPickerEntry";
import { TagSuggestionRow } from "./TagSuggestionRow";
import { useChipMotion } from "./useChipMotion";
import { useTagEntry } from "./useTagEntry";
import { useTagLimitFocus } from "./useTagLimitFocus";

export interface TagPickerLabels {
  /** The input's accessible name. */
  input: string;
  placeholder?: string;
  /** The × button's accessible name for a chip. */
  remove: (tag: string) => string;
  /** A quick-add chip's accessible name; its visible text otherwise. */
  add?: (tag: string) => string;
  /** The quick-add row's label, such as "Popular". */
  suggestions?: string;
  /** Closed mode: shown in the listbox when nothing matches. */
  noMatch?: (query: string) => string;
  /** Shown in place of the input at the limit. */
  full?: string;
}

export interface TagPickerProps {
  tags: readonly string[];
  /** Closed mode: always one of `options`. Free mode: the trimmed text. The
   *  caller validates, normalises, de-duplicates and caps. Free mode can call
   *  this several times in one event (a pasted "a,b,c"), so add against the
   *  latest list, for example with a functional state update. */
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  /** A closed vocabulary. Omitted, entry is free. */
  options?: readonly string[];
  /** Quick-add chips. Ones already chosen are hidden here. */
  suggestions?: readonly string[];
  /** At the limit the input gives way to `labels.full` and quick-adds hide. */
  limit?: number;
  /** "inline": chips and a pill input in an open row (the profile editor).
   *  "boxed": chips and a borderless input inside one bordered field. */
  frame?: "inline" | "boxed";
  /** Display form of a tag, such as a leading `#`. */
  formatTag?: (tag: string) => string;
  /** A trailing "Browse all" button; the caller renders what it opens. */
  browse?: { label: string; onClick: () => void; isExpanded?: boolean };
  /** Rendered between the chip row and the quick-add row. */
  hint?: ReactNode;
  inputDescribedBy?: string;
  className?: string;
  labels: TagPickerLabels;
}

const asTyped = (tag: string) => tag;

/** A React key per chip: the tag, plus its count among equal earlier tags,
 *  so a legacy duplicate ("they, they") gets a key of its own. A newline can
 *  never be typed into the input, so it cannot collide with a real tag. */
function chipKeysFor(tags: readonly string[]): string[] {
  const seenCounts = new Map<string, number>();
  return tags.map((tag) => {
    const count = seenCounts.get(tag) ?? 0;
    seenCounts.set(tag, count + 1);
    return count === 0 ? tag : `${tag}\n${count}`;
  });
}

/**
 * The shared add/remove chip field: a `ChipList` whose last item is the entry
 * input, an optional hint, and a quick-add row. `useTagEntry` holds the key
 * rules.
 *
 * Reaching the limit while focus is in the picker moves focus onto the
 * "full" message, because the control it was on has just gone
 * (`useTagLimitFocus`). In the boxed frame a click on the box's blank space
 * focuses the input, as it would in a plain text field.
 *
 * Mounting this conditionally inside a modal, sheet or `Collapse` registers a
 * layout presence entry with that parent, so give the conditional mount its
 * own `AnimatePresence`.
 */
export function TagPicker({
  tags,
  onAdd,
  onRemove,
  options,
  suggestions = [],
  limit,
  frame = "inline",
  formatTag = asTyped,
  browse,
  hint,
  inputDescribedBy,
  className,
  labels,
}: TagPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { transition } = useChipMotion();
  const { rootRef, fullRef, isAtLimit, add } = useTagLimitFocus({
    tagCount: tags.length,
    limit,
    hasFullLabel: Boolean(labels.full),
    onAdd,
  });
  const isBoxed = frame === "boxed";
  const entry = useTagEntry({ tags, options, onAdd: add });
  const chipKeys = chipKeysFor(tags);

  const chosen = new Set(tags.map((tag) => tag.toLowerCase()));
  const openSuggestions = isAtLimit
    ? []
    : suggestions.filter((tag) => !chosen.has(tag.toLowerCase()));
  const hasSuggestionRow = openSuggestions.length > 0 || Boolean(browse);

  return (
    <div ref={rootRef} className={cx(styles.picker, className)}>
      <ChipList
        items={tags}
        getKey={(tag, index) => chipKeys[index] ?? tag}
        renderLabel={formatTag}
        removeLabel={labels.remove}
        onRemove={(tag) => onRemove(tag)}
        emptyFocusRef={inputRef}
        blankClickFocusRef={isBoxed ? inputRef : undefined}
        className={isBoxed ? styles.box : undefined}
      >
        {/* Its own AnimatePresence: a conditional `layout` element must be a
            direct presence child, or it leaks a presence entry into the
            nearest parent AnimatePresence (a modal) and freezes its exit.
            Neither side has an exit animation, so no keystroke lands in an
            input on its way out. `popLayout` lifts the leaving side out of
            the flow in the same frame the other mounts, so the row never
            holds both and the box height stays put. popLayout puts its own
            `ref` on each child, so the focus target is the inner span. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {isAtLimit ? (
            <m.span
              key="full"
              className={styles.full}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transition}
            >
              <span ref={fullRef} tabIndex={-1} className={styles.fullText}>
                {labels.full}
              </span>
            </m.span>
          ) : (
            <TagPickerEntry
              key="entry"
              entry={entry}
              isClosed={options !== undefined}
              isBoxed={isBoxed}
              inputRef={inputRef}
              describedBy={inputDescribedBy}
              formatTag={formatTag}
              labels={labels}
            />
          )}
        </AnimatePresence>
      </ChipList>
      {hint}
      <Collapse isOpen={hasSuggestionRow}>
        <TagSuggestionRow
          suggestions={openSuggestions}
          label={labels.suggestions}
          addLabel={labels.add}
          formatTag={formatTag}
          browse={browse}
          onAdd={add}
          fallbackFocusRef={inputRef}
        />
      </Collapse>
    </div>
  );
}
