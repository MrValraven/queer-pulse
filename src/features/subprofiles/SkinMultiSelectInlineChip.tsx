import type { Ref } from "react";
import { m, useIsPresent, type Transition } from "motion/react";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import { cx } from "../../shared/lib/cx";
import type { MultiSelectEntry } from "./skinMultiSelectValue";
import styles from "./SkinMultiSelectInline.module.css";

export interface InlineChip extends MultiSelectEntry {
  /** Declared in `featuredValues`: always shown, pressed or not. */
  isFeatured: boolean;
}

/** One toggle chip. A featured chip leads with a plus (off) or a check (on);
 *  a chosen chip off the featured list is always pressed and ends with a
 *  cross, since pressing it removes it. It pops in and out and glides to its
 *  new place in the row. On its way out it is `inert` and drops
 *  `data-inline-chip`, so the row's focus search after a removal counts only
 *  the chips that stay. `ref` is the one AnimatePresence uses to measure the
 *  chip before lifting it out of the row. */
export function InlineChipButton({
  chip,
  isPressed,
  onPress,
  transition,
  ref,
}: {
  chip: InlineChip;
  isPressed: boolean;
  onPress: () => void;
  transition: Transition;
  ref?: Ref<HTMLButtonElement>;
}) {
  const isPresent = useIsPresent();
  const LeadIcon = isPressed ? FiCheck : FiPlus;
  return (
    <m.button
      ref={ref}
      type="button"
      data-inline-chip={isPresent ? "" : undefined}
      inert={!isPresent}
      aria-pressed={isPressed}
      className={cx(
        styles.chip,
        isPressed && styles.chipPressed,
        chip.isCustom && styles.chipCustom,
      )}
      onClick={onPress}
      layout="position"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={transition}
    >
      {chip.isFeatured && (
        <LeadIcon aria-hidden focusable="false" className={styles.chipIcon} />
      )}
      <span className={styles.chipText}>{chip.label}</span>
      {!chip.isFeatured && (
        <FiX aria-hidden focusable="false" className={styles.chipRemoveIcon} />
      )}
    </m.button>
  );
}
