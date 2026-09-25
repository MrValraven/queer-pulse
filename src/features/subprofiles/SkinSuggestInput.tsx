import { useRef, type RefObject } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { SkinSuggest } from "./useSkinSuggestInput";
import styles from "./SkinSuggestInput.module.css";

/**
 * A text input with a type-ahead list of names (`useSkinSuggestInput`): the
 * input as an ARIA 1.2 combobox, plus a chevron at its right edge that shows
 * or hides the whole list. The list itself is `SkinSuggestList`, rendered
 * wherever the caller has room for it (a pair row spans it across the row).
 * The input's title carries its text, so a long name cut off in a narrow
 * column reads in full on hover.
 */
export function SkinSuggestInput({
  suggest,
  fieldRef,
  className,
  placeholder,
  "aria-label": ariaLabel,
  "aria-keyshortcuts": ariaKeyShortcuts,
}: {
  suggest: SkinSuggest;
  /** `SkinSuggestRefs.fieldRef`, as passed to the hook. */
  fieldRef: RefObject<HTMLDivElement | null>;
  /** The input surface (`refinedSurfaceClassName`). */
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  "aria-keyshortcuts"?: string;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeOptionId =
    suggest.activeIndex >= 0
      ? suggest.optionId(suggest.activeIndex)
      : undefined;

  return (
    <div ref={fieldRef} className={styles.field} onBlur={suggest.onFieldBlur}>
      <input
        ref={inputRef}
        className={cx(className, styles.input)}
        value={suggest.value}
        title={suggest.value || undefined}
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggest.isListVisible}
        aria-controls={suggest.listboxId}
        aria-activedescendant={activeOptionId}
        aria-label={ariaLabel}
        aria-keyshortcuts={ariaKeyShortcuts}
        autoComplete="off"
        onChange={(event) => suggest.onInputChange(event.target.value)}
        onClick={suggest.onInputClick}
        onKeyDown={suggest.onInputKeyDown}
      />
      {/* Out of the tab order: the arrow keys open the list from the input.
          A press keeps focus in the input. The label stays put and
          aria-expanded says whether the list shows. */}
      <button
        type="button"
        tabIndex={-1}
        className={cx(
          styles.chevron,
          suggest.isListVisible && styles.chevronOpen,
        )}
        aria-label={t("subprofiles:skinControl.suggest.show")}
        aria-expanded={suggest.isListVisible}
        aria-controls={suggest.listboxId}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          inputRef.current?.focus();
          suggest.toggleList();
        }}
      >
        <FiChevronDown aria-hidden />
      </button>
    </div>
  );
}

/**
 * The type-ahead list of a `SkinSuggestInput`, in flow under the field, so
 * it pushes the content below it down. Options are buttons out of the tab
 * order: the input keeps focus and points at the active one through
 * `aria-activedescendant`, and a press on an option keeps focus there too.
 * The list takes the input's own label as its name (a labelledby pointing
 * at the input would name it by the typed text instead).
 */
export function SkinSuggestList({
  suggest,
  listboxRef,
  className,
  "aria-label": ariaLabel,
}: {
  suggest: SkinSuggest;
  /** `SkinSuggestRefs.listboxRef`, as passed to the hook. */
  listboxRef: RefObject<HTMLDivElement | null>;
  className?: string;
  /** The same label as the input's. */
  "aria-label"?: string;
}) {
  if (!suggest.isListVisible) return null;
  return (
    <div
      ref={listboxRef}
      id={suggest.listboxId}
      role="listbox"
      aria-label={ariaLabel}
      className={cx(styles.list, className)}
    >
      {suggest.matches.map((name, index) => {
        const isActive = index === suggest.activeIndex;
        return (
          <button
            key={name}
            type="button"
            id={suggest.optionId(index)}
            role="option"
            tabIndex={-1}
            aria-selected={isActive}
            className={cx(styles.option, isActive && styles.optionActive)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => suggest.pick(name)}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
