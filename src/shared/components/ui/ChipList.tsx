import {
  useRef,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiX } from "react-icons/fi";
import { cx } from "../../lib/cx";
import styles from "./ChipList.module.css";
import { useChipMotion } from "./useChipMotion";

export interface ChipListProps<T> {
  items: readonly T[];
  getKey: (item: T, index: number) => string;
  renderLabel: (item: T) => ReactNode;
  /** The × button's accessible name. */
  removeLabel: (item: T) => string;
  onRemove: (item: T, index: number) => void;
  /** Where focus goes when the last chip is removed, usually the entry input. */
  emptyFocusRef?: RefObject<HTMLElement | null>;
  /** A press on the row's blank space (the gaps, the empty end of a line)
   *  focuses this, for a row drawn as one text field. */
  blankClickFocusRef?: RefObject<HTMLElement | null>;
  /** Trailing content in the same row, such as the entry input. */
  children?: ReactNode;
  className?: string;
}

/**
 * A row of removable chips, the shared base of every add/remove chip field.
 *
 * A chip that joins or leaves pops in or out and the chips after it glide
 * over. The row is a `layoutRoot` (with `layout` beside it, which a root
 * needs to be measured), so the glide is measured inside the row: the row
 * moving with the page never flings a chip across it.
 *
 * Removing a chip moves focus to the next chip's ×, else the previous one,
 * else `emptyFocusRef`, else the row itself, so focus never drops to the page.
 *
 * Mounting this conditionally inside a modal, sheet or `Collapse` registers a
 * layout presence entry with that parent, so give the conditional mount its
 * own `AnimatePresence`.
 */
export function ChipList<T>({
  items,
  getKey,
  renderLabel,
  removeLabel,
  onRemove,
  emptyFocusRef,
  blankClickFocusRef,
  children,
  className,
}: ChipListProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null);

  function focusFromBlank(event: MouseEvent<HTMLDivElement>) {
    const target = blankClickFocusRef?.current;
    if (!target || event.target !== event.currentTarget) return;
    // Keeps the press from moving focus to the page before the input takes it.
    event.preventDefault();
    target.focus();
  }

  function removeAt(item: T, index: number) {
    const removeButtons = Array.from(
      rowRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-chip-remove]",
      ) ?? [],
    );
    const nextFocus =
      removeButtons[index + 1] ??
      removeButtons[index - 1] ??
      emptyFocusRef?.current;
    onRemove(item, index);
    if (nextFocus) {
      nextFocus.focus();
    } else {
      // Nothing left to focus: the row itself is the last resort. It carries
      // no `tabIndex` at rest, so a mouse click on a chip label or the gap
      // between chips never focuses it (a boxed field's `:focus-within` glow
      // would otherwise paint with no caret anywhere). `tabIndex` is set only
      // for this one focus call and removed again on the row's next blur.
      const row = rowRef.current;
      if (!row) return;
      row.tabIndex = -1;
      row.addEventListener("blur", () => row.removeAttribute("tabindex"), {
        once: true,
      });
      row.focus();
    }
  }

  return (
    <m.div
      ref={rowRef}
      layout="position"
      layoutRoot
      className={cx(styles.row, className)}
      onMouseDown={blankClickFocusRef ? focusFromBlank : undefined}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item, index) => (
          <ChipListItem
            key={getKey(item, index)}
            label={renderLabel(item)}
            removeLabel={removeLabel(item)}
            onRemove={() => removeAt(item, index)}
          />
        ))}
      </AnimatePresence>
      {children}
    </m.div>
  );
}

/** One chip. On its way out it is hidden from assistive tech, drops out of
 *  the tab order and ignores the pointer, and drops `data-chip-remove` so the
 *  row's focus search counts only chips that stay. `inert` is avoided on
 *  purpose: inside a `useDismiss` modal it breaks the focus trap. `ref` is the
 *  one AnimatePresence uses to measure the chip before lifting it out. */
function ChipListItem({
  label,
  removeLabel,
  onRemove,
  ref,
}: {
  label: ReactNode;
  removeLabel: string;
  onRemove: () => void;
  ref?: Ref<HTMLSpanElement>;
}) {
  const isPresent = useIsPresent();
  const { chip } = useChipMotion();
  return (
    <m.span
      ref={ref}
      className={styles.chip}
      aria-hidden={isPresent ? undefined : true}
      data-leaving={isPresent ? undefined : ""}
      {...chip}
    >
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={styles.remove}
        aria-label={removeLabel}
        data-chip-remove={isPresent ? "" : undefined}
        tabIndex={isPresent ? undefined : -1}
        onClick={onRemove}
      >
        <FiX aria-hidden focusable="false" />
      </button>
    </m.span>
  );
}
