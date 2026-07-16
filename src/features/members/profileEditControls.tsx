import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { FiX } from "react-icons/fi";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import { PRONOUN_OPTIONS, VISIBILITY_OPTIONS } from "./profileEdit.data";
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

/** Auto-growing textarea that mirrors the bio paragraph's type. */
export function InlineTextarea({
  value,
  onChange,
  ariaLabel,
  className,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  /** Starting height. The textarea grows past this as the value wraps. */
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
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

/** Quick-pick pronoun chips with a free-text fallback for anything custom. */
export function PronounPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const isPreset = (PRONOUN_OPTIONS as readonly string[]).includes(value);
  return (
    <div className={styles.chips}>
      {PRONOUN_OPTIONS.map((p) => (
        <button
          key={p}
          type="button"
          className={`${styles.chip} ${value === p ? styles.chipSelected : ""}`}
          aria-pressed={value === p}
          onClick={() => onChange(value === p ? "" : p)}
        >
          {p}
        </button>
      ))}
      <input
        className={`${styles.inlineInput} ${styles.customPronoun}`}
        value={isPreset ? "" : value}
        placeholder="custom…"
        aria-label="Custom pronouns"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Chip editor: remove with ×, add by typing and pressing Enter. */
export function TagEditor({
  tags,
  onChange,
  placeholder = "Add a tag…",
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (!v) return;
    if (!tags.some((t) => t.toLowerCase() === v.toLowerCase()))
      onChange([...tags, v]);
    setInput("");
  }
  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }
  return (
    <div className={styles.tagEditor}>
      {tags.map((t) => (
        <span key={t} className={styles.tag}>
          {t}
          <button
            type="button"
            className={styles.tagRemove}
            aria-label={`Remove ${t}`}
            onClick={() => onChange(tags.filter((x) => x !== t))}
          >
            <FiX size={13} />
          </button>
        </span>
      ))}
      <input
        className={`${styles.inlineInput} ${styles.tagInput}`}
        value={input}
        placeholder={placeholder}
        aria-label="Add a tag"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
      />
    </div>
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
  const active = VISIBILITY_OPTIONS.find((o) => o.value === value);
  return (
    <div>
      <div
        className={styles.segmented}
        role="radiogroup"
        aria-label="Profile visibility"
      >
        {VISIBILITY_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={`${styles.segment} ${value === o.value ? styles.segmentActive : ""}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {active && <p className={styles.visHint}>{active.hint}</p>}
    </div>
  );
}

/** Discards the editor on Escape while `enabled` — used by the edit bar. */
export function useEscapeToCancel(onCancel: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, enabled]);
}
