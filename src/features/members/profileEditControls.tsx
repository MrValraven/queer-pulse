import { useRef } from "react";
import { RadioCardGroup } from "../../shared/components/ui";
import { useAutoGrowTextarea } from "../../shared/hooks/useAutoGrowTextarea";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { VISIBILITY_OPTIONS } from "./profileEdit.data";
import styles from "./ProfileEdit.module.css";

/** Seamless single-line text field that inherits its surroundings' typography. */
export function InlineText({
  value,
  onChange,
  ariaLabel,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      className={`${styles.inlineInput} ${className ?? ""}`}
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Auto-growing textarea that mirrors the bio paragraph's type.
 *
 *  With `mentions`, it becomes the shared `MentionTextarea` instead: same type,
 *  same growing box, plus the `@member` / `c/community` / `#topic` /
 *  `b/business` / `e/event` / `t/thread` typeahead the chat and forum
 *  composers already have. The bio fields opt in; the short single-purpose
 *  fields around them stay plain, so a stray `@` in a neighbourhood name never
 *  opens a suggestion popup. */
export function InlineTextarea({
  value,
  onChange,
  ariaLabel,
  className,
  placeholder,
  rows = 3,
  mentions = false,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  /** Starting height. The textarea grows past this as the value wraps. */
  rows?: number;
  /** Offer the six mention shortcuts while typing. */
  mentions?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoGrowTextarea(ref, value, !mentions);
  if (mentions) {
    return (
      <MentionTextarea
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`${styles.inlineInput} ${className ?? ""}`}
        rows={rows}
        placeholder={placeholder}
        autoGrow
      />
    );
  }
  return (
    <textarea
      ref={ref}
      className={`${styles.inlineInput} ${className ?? ""}`}
      value={value}
      rows={rows}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Segmented Open / Network / Private control with a contextual hint. */
export function VisibilityPicker({
  value,
  onChange,
}: {
  value: VisibilityMode;
  onChange: (v: VisibilityMode) => void;
}) {
  const { t } = useTranslation();
  const active = VISIBILITY_OPTIONS.find((option) => option.value === value);

  // The radiogroup semantics, the roving tabindex and the arrow/Home/End
  // keyboard model all come from the shared primitive, so this control and
  // every other single-select group behave identically.
  return (
    <div>
      <RadioCardGroup<VisibilityMode>
        className={styles.segmented}
        optionClassName={styles.segment}
        checkedClassName={styles.segmentActive}
        ariaLabel={t("members:profileEdit.visibilityGroupLabel")}
        value={value}
        onChange={onChange}
        options={VISIBILITY_OPTIONS.map((option) => ({
          id: option.value,
          render: t(option.labelKey),
        }))}
      />
      {active && <p className={styles.visHint}>{t(active.hintKey)}</p>}
    </div>
  );
}
