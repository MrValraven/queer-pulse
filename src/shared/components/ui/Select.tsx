import { useId, useRef, useState, type ReactNode } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import { useOutsideDismiss } from "../../hooks/useOutsideDismiss";
import { useTranslation } from "../../i18n/useTranslation";
import { Tag } from "./Tag";
import { SelectPanel } from "./SelectPanel";
import styles from "./Select.module.css";

/** One choosable row. `label` is what shows; `keywords` widens what the search
 *  filter matches (required to make a non-string `label` filterable). */
export interface SelectOption {
  value: string;
  label: ReactNode;
  /** Extra text the typeahead filter matches, beyond a string `label`. */
  keywords?: string;
  disabled?: boolean;
  /** Groups options under a heading; first-seen order wins. */
  group?: string;
}

/** State passed to a caller's `renderOption`, so rows can reflect selection. */
export interface SelectOptionState {
  selected: boolean;
  active: boolean;
}

interface SelectBaseProps {
  options: readonly SelectOption[];
  /** Trigger placeholder when nothing is chosen. */
  placeholder?: string;
  /**
   * Accessible name for the control. Prefer `labelledBy` pointing at a visible
   * heading. This is a self-labelling primitive (like `ChipSelect`) — it is not
   * meant to be wrapped in `FormField`, which won't wire a custom child.
   */
  label?: string;
  /** `id` of a visible label element that names the control. Wins over `label`. */
  labelledBy?: string;
  disabled?: boolean;
  /** Show a loading state in the panel instead of options. */
  loading?: boolean;
  /**
   * Show the typeahead search box. Defaults to on once there are more than a
   * handful of options; pass a boolean to force it either way.
   */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Panel content when the filter matches nothing. */
  emptyText?: ReactNode;
  /** Render a row yourself (avatars, icons, two-line rows…). */
  renderOption?: (option: SelectOption, state: SelectOptionState) => ReactNode;
  className?: string;
  /** Id placed on the trigger button, so a `<label htmlFor>` can target it. */
  id?: string;
  /** Renders the trigger in the errored border style. */
  invalid?: boolean;
  /** `"md"` (default, form fields) or `"sm"` (compact — filter bars, toolbars). */
  size?: "md" | "sm";
  // ── Accessibility props FormField injects when Select is its child. Declared
  //    so they type-check on the element and land on the trigger, not a wrapper.
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

interface SingleSelectProps extends SelectBaseProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
  /** Allow clearing back to no selection via an inline ✕ (single-select only). */
  clearable?: boolean;
}

interface MultiSelectProps extends SelectBaseProps {
  multiple: true;
  value: readonly string[];
  onChange: (value: string[]) => void;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

/** How many multi-select tags to show in the trigger before collapsing to "+N". */
const MAX_VISIBLE_TAGS = 3;
/** Above this option count the search box is shown by default. */
const SEARCH_THRESHOLD = 7;

/**
 * Unified searchable Select: a `<button>` trigger opening a floating panel with
 * a typeahead filter and a `role="listbox"` of options. Single-select by
 * default; pass `multiple` for a `string[]` value with tag display. Self-labels
 * via `label`/`labelledBy`. Replaces the app's ad-hoc native `<select>`s.
 */
export function Select(props: SelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const {
    options,
    placeholder,
    label,
    labelledBy,
    disabled = false,
    loading = false,
    searchable = options.length > SEARCH_THRESHOLD,
    searchPlaceholder,
    emptyText,
    renderOption,
    className,
    id,
    invalid = false,
    size = "md",
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  } = props;

  const showInvalid = invalid || ariaInvalid === true || ariaInvalid === "true";

  const selectedValues: ReadonlySet<string> = new Set(
    props.multiple ? props.value : props.value != null ? [props.value] : [],
  );

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useOutsideDismiss(open, containerRef, () => setOpen(false));

  const handleSelect = (value: string) => {
    if (props.multiple) {
      const next = new Set(props.value);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      props.onChange([...next]);
      return;
    }
    props.onChange(value);
    close();
  };

  const clearSingle = () => {
    if (!props.multiple) props.onChange(null);
  };

  const canClear =
    !props.multiple && props.clearable && props.value != null && !disabled;

  const triggerLabel =
    props.multiple && selectedValues.size > 0
      ? t("shared:select.multiSummary", { count: selectedValues.size })
      : undefined;

  return (
    <div
      ref={containerRef}
      className={[styles.container, open && styles.open, className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={[
          styles.trigger,
          size === "sm" && styles.sm,
          showInvalid && styles.invalid,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        // aria-describedby links FormField's helper/error text. `aria-invalid`
        // and `aria-required` aren't valid on role=button, so the error is
        // carried visually (showInvalid border) + via the described error text,
        // and requiredness by FormField's visible `*` — not ARIA states here.
        aria-describedby={ariaDescribedBy}
        aria-label={labelledBy ? undefined : (triggerLabel ?? label)}
        aria-labelledby={labelledBy}
        onClick={() => setOpen((value) => !value)}
      >
        <SelectValue
          options={options}
          selectedValues={selectedValues}
          multiple={props.multiple === true}
          placeholder={placeholder ?? t("shared:select.placeholder")}
        />
        <FiChevronDown
          className={[styles.chevron, open && styles.chevronOpen]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </button>

      {canClear && (
        <button
          type="button"
          className={styles.clear}
          aria-label={t("shared:select.clear")}
          onClick={clearSingle}
        >
          <FiX aria-hidden />
        </button>
      )}

      {open && (
        <SelectPanel
          baseId={baseId}
          listboxId={listboxId}
          options={options}
          selected={selectedValues}
          multiple={props.multiple === true}
          searchable={searchable}
          loading={loading}
          emptyText={emptyText ?? t("shared:select.noResults")}
          searchPlaceholder={
            searchPlaceholder ?? t("shared:select.searchPlaceholder")
          }
          loadingText={t("shared:select.loading")}
          listboxLabel={label ?? placeholder ?? t("shared:select.placeholder")}
          renderOption={renderOption}
          onSelect={handleSelect}
          onClose={close}
        />
      )}
    </div>
  );
}

/**
 * Opt into FormField's a11y wiring: unlike an arbitrary component, Select
 * forwards the injected `id`/`aria-describedby`/`aria-invalid`/`aria-required`
 * onto its trigger, so a `<FormField label helper error>` can wrap a `<Select>`
 * exactly like it wraps a native `<select>`. See FormField's `wireableControl`.
 */
Select.formFieldControl = true;

/** The trigger's inner content: placeholder, a single label, or multi tags. */
function SelectValue({
  options,
  selectedValues,
  multiple,
  placeholder,
}: {
  options: readonly SelectOption[];
  selectedValues: ReadonlySet<string>;
  multiple: boolean;
  placeholder: string;
}) {
  if (selectedValues.size === 0) {
    return <span className={styles.placeholder}>{placeholder}</span>;
  }

  if (!multiple) {
    const current = options.find((option) => selectedValues.has(option.value));
    return (
      <span className={styles.value}>{current?.label ?? placeholder}</span>
    );
  }

  const chosen = options.filter((option) => selectedValues.has(option.value));
  const visible = chosen.slice(0, MAX_VISIBLE_TAGS);
  const overflow = chosen.length - visible.length;
  return (
    <span className={styles.tags}>
      {visible.map((option) => (
        <Tag key={option.value}>{option.label}</Tag>
      ))}
      {overflow > 0 && <Tag className={styles.overflowTag}>+{overflow}</Tag>}
    </span>
  );
}
