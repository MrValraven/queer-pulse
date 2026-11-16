import { useId, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./adminUi.module.css";
import { useStripEdgeFade } from "./useStripEdgeFade";

export interface AdminSegOption {
  value: string;
  /** Already-resolved display label — call sites pass `t(labelKey)`. */
  label: string;
}

/**
 * Segmented pill control — one value selected at a time. `options` carry a
 * stable canonical `value` (never translated — it's what call sites persist
 * or compare against) alongside a pre-resolved `label` for display, so a
 * language switch never corrupts stored state (spec: label-key indirection).
 */
export function AdminSeg({
  options,
  value,
  onChange,
  ariaLabelledby,
  className,
}: {
  options: AdminSegOption[];
  value: string;
  onChange: (value: string) => void;
  /** Extra class on the group wrapper, for a call site that lays the
   *  buttons out its own way. On a phone the kit already keeps every label
   *  on one line and scrolls the group sideways. */
  className?: string;
  /** Associates the `role="group"` wrapper with a visible label elsewhere on
   *  the page, so the group itself is not an anonymous landmark to a screen
   *  reader even though each button already names itself. Optional: a call
   *  site with no adjacent visible label can omit it. */
  ariaLabelledby?: string;
}) {
  // On a phone the group scrolls sideways in one line; the side that hides
  // options fades out and the chosen option is kept in view.
  const { stripRef, edgeProps } = useStripEdgeFade<HTMLDivElement>(
    `${options.map((option) => option.value).join("|")}:${value}`,
    '[aria-pressed="true"]',
  );
  return (
    <div
      ref={stripRef}
      className={[styles.seg, className].filter(Boolean).join(" ")}
      role="group"
      aria-labelledby={ariaLabelledby}
      {...edgeProps}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={[styles.segBtn, value === o.value && styles.segOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Switch toggle. `disabled` is for a setting the platform has no backing
 *  data for yet: greyed out and inert, so it shows no state the platform
 *  cannot back. */
export function AdminToggle({
  checked,
  onChange,
  label,
  inlineLabel,
  disabled = false,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Screen-reader name for a switch with no visible text beside it. */
  label?: string;
  /** Visible text beside the switch ("Breached only"). It names the switch
   *  and toggles it on click, so `label` can be left out. */
  inlineLabel?: string;
  disabled?: boolean;
  /** Lets a visible `<label htmlFor>` name the switch and toggle it on
   *  click; a call site that labels it that way can omit `label`. */
  id?: string;
}) {
  const generatedId = useId();
  const switchId = id ?? (inlineLabel ? generatedId : undefined);
  const inlineLabelId = `${generatedId}-label`;
  const switchButton = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={inlineLabel ? undefined : label}
      aria-labelledby={inlineLabel ? inlineLabelId : undefined}
      disabled={disabled}
      className={[
        styles.toggle,
        checked && styles.toggleOn,
        disabled && styles.toggleDisabled,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
    >
      <span className={styles.toggleKnob} aria-hidden />
    </button>
  );
  if (!inlineLabel) return switchButton;
  return (
    <span
      className={[styles.toggleLine, disabled && styles.toggleLineDisabled]
        .filter(Boolean)
        .join(" ")}
    >
      {switchButton}
      <label
        id={inlineLabelId}
        htmlFor={switchId}
        className={styles.toggleLabel}
      >
        {inlineLabel}
      </label>
    </span>
  );
}

/** Selectable check-line — a checkbox row with a title + sub. */
export function AdminCheckLine({
  checked,
  onChange,
  title,
  sub,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={[styles.checkLine, checked && styles.checkLineOn]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.checkBox} aria-hidden>
        {checked && <FiCheck />}
      </span>
      <span className={styles.checkTx}>
        <span className={styles.checkTitle}>{title}</span>
        {sub && <span className={styles.checkSub}>{sub}</span>}
      </span>
    </button>
  );
}
