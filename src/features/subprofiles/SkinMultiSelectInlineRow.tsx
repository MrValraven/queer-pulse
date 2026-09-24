import { useRef, type RefObject } from "react";
import { FiCheck, FiChevronUp, FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { SkinBlockControl } from "./skinBlockFields.data";
import {
  multiSelectEntry,
  type MultiSelectEntry,
} from "./skinMultiSelectValue";
import type { SkinMultiSelect } from "./useSkinMultiSelect";
import styles from "./SkinMultiSelectInline.module.css";

const ACTION_KEYS = {
  more: "subprofiles:skinControl.refined.multiSelect.more",
  addOwn: "subprofiles:skinControl.multiSelect.addOwn",
  choose: "subprofiles:skinControl.refined.multiSelect.choose",
} as const;

/** The action chip's label while the panel is open. */
const CLOSE_KEY = "subprofiles:skinControl.refined.close";

type ActionKind = keyof typeof ACTION_KEYS;

interface InlineChip extends MultiSelectEntry {
  /** Declared in `featuredValues`: always shown, pressed or not. */
  isFeatured: boolean;
}

/** The row's chips: the featured options in their declared order, then the
 *  chosen values off that list (other listed options first, then the owner's
 *  own words), each group in stored order. */
function inlineChips(
  select: SkinMultiSelect,
  featuredValues: string[],
): InlineChip[] {
  const featuredChips = featuredValues.map((value) => ({
    ...multiSelectEntry(value, select.options),
    isFeatured: true,
  }));
  const offList = select.entries
    .filter((entry) => !featuredValues.includes(entry.value))
    .map((entry) => ({ ...entry, isFeatured: false }));
  return [
    ...featuredChips,
    ...offList.filter((entry) => !entry.isCustom),
    ...offList.filter((entry) => entry.isCustom),
  ];
}

/** The trailing chip that opens the full list: "More" while options sit
 *  beyond the featured ones, "Add your own" once every option is featured,
 *  "Choose" when nothing is featured. `null` when the panel has nothing to
 *  add. */
function actionKindOf(
  control: SkinBlockControl,
  featuredCount: number,
  optionCount: number,
): ActionKind | null {
  const hasPanelContent = optionCount > 0 || Boolean(control.allowsCustom);
  if (featuredCount === 0) return hasPanelContent ? "choose" : null;
  if (optionCount > featuredCount) return "more";
  return control.allowsCustom ? "addOwn" : null;
}

/** One toggle chip. A featured chip leads with a plus (off) or a check (on);
 *  a chosen chip off the featured list is always pressed and ends with a
 *  cross, since pressing it removes it. */
function InlineChipButton({
  chip,
  isPressed,
  onPress,
}: {
  chip: InlineChip;
  isPressed: boolean;
  onPress: () => void;
}) {
  const LeadIcon = isPressed ? FiCheck : FiPlus;
  return (
    <button
      type="button"
      data-inline-chip=""
      aria-pressed={isPressed}
      className={cx(
        styles.chip,
        isPressed && styles.chipPressed,
        chip.isCustom && styles.chipCustom,
      )}
      onClick={onPress}
    >
      {chip.isFeatured && (
        <LeadIcon aria-hidden focusable="false" className={styles.chipIcon} />
      )}
      <span className={styles.chipText}>{chip.label}</span>
      {!chip.isFeatured && (
        <FiX aria-hidden focusable="false" className={styles.chipRemoveIcon} />
      )}
    </button>
  );
}

/**
 * The multiSelect's chip row: a group named by the field label and
 * described by its helper. Featured chips toggle in place (silent, as the
 * panel's checkboxes: the pressed state speaks). Pressing a chip off the
 * featured list removes it, announced, and moves focus to the next chip,
 * else the previous one, else the action chip, so focus never drops to the
 * page. The action chip is the hook's trigger: it opens the panel and,
 * while open, reads "Close" with a chevron up; Escape or Done returns focus
 * to it. It is also the jump target (`data-jump-target`), so a jump to this
 * field lands on a control that leaves the value as it is.
 */
export function MultiSelectInlineRow({
  select,
  control,
  labelId,
  describedBy,
  panelId,
  triggerRef,
}: {
  select: SkinMultiSelect;
  control: SkinBlockControl;
  labelId: string;
  describedBy: string | undefined;
  panelId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useTranslation();
  const rowRef = useRef<HTMLDivElement>(null);
  const featuredValues = (control.featuredValues ?? []).filter((value) =>
    select.options.some((option) => option.value === value),
  );
  const chips = inlineChips(select, featuredValues);
  const actionKind = actionKindOf(
    control,
    featuredValues.length,
    select.options.length,
  );
  const ActionIcon = select.isOpen ? FiChevronUp : FiPlus;

  function removeAt(index: number, value: string): void {
    const chipButtons = Array.from(
      rowRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-inline-chip]",
      ) ?? [],
    );
    const nextFocus =
      chipButtons[index + 1] ?? chipButtons[index - 1] ?? triggerRef.current;
    select.removeChip(value);
    nextFocus?.focus();
  }

  return (
    <div
      ref={rowRef}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      className={styles.row}
    >
      {chips.map((chip, index) => (
        <InlineChipButton
          key={chip.value}
          chip={chip}
          isPressed={chip.isFeatured ? select.isChosen(chip.value) : true}
          onPress={() =>
            chip.isFeatured
              ? select.toggle(chip.value)
              : removeAt(index, chip.value)
          }
        />
      ))}
      {actionKind && (
        <button
          type="button"
          ref={triggerRef}
          data-jump-target=""
          className={styles.action}
          aria-expanded={select.isOpen}
          aria-controls={select.isOpen ? panelId : undefined}
          onClick={select.toggleOpen}
        >
          <ActionIcon
            aria-hidden
            focusable="false"
            className={styles.actionIcon}
          />
          <span>{t(select.isOpen ? CLOSE_KEY : ACTION_KEYS[actionKind])}</span>
        </button>
      )}
    </div>
  );
}
