import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { FiX } from "react-icons/fi";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRONOUN_OPTIONS, VISIBILITY_OPTIONS } from "./profileEdit.data";
import { POPULAR_PROFILE_TAGS, PROFILE_TAG_OPTIONS } from "./profileTags.data";
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
  const { t } = useTranslation();
  const isPreset = (PRONOUN_OPTIONS as readonly string[]).includes(value);
  return (
    <div className={styles.chips}>
      {PRONOUN_OPTIONS.map((pronoun) => (
        <button
          key={pronoun}
          type="button"
          className={`${styles.chip} ${value === pronoun ? styles.chipSelected : ""}`}
          aria-pressed={value === pronoun}
          onClick={() => onChange(value === pronoun ? "" : pronoun)}
        >
          {pronoun}
        </button>
      ))}
      <input
        className={`${styles.inlineInput} ${styles.customPronoun}`}
        value={isPreset ? "" : value}
        placeholder={t("members:profileEdit.customPronounPlaceholder")}
        aria-label={t("members:profileEdit.customPronounsLabel")}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Tag picker: choose skills from a curated vocabulary (PROFILE_TAG_OPTIONS).
 * Search to filter matching options, quick-add from a popular row, remove with ×.
 * Only tags in the list can be added; legacy off-list tags still show and remove.
 */
export function TagEditor({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const [focused, setFocused] = useState(false);

  const isSelected = (option: string) =>
    tags.some((tag) => tag.toLowerCase() === option.toLowerCase());

  const matches = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return [];
    return PROFILE_TAG_OPTIONS.filter(
      (option) => option.toLowerCase().includes(query) && !isSelected(option),
    ).slice(0, 6);
    // isSelected reads `tags`, so `tags` is the real dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, tags]);

  const popular = useMemo(
    () => POPULAR_PROFILE_TAGS.filter((option) => !isSelected(option)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tags],
  );

  const showSuggestions = focused && matches.length > 0;

  function add(candidate: string) {
    const canonical = PROFILE_TAG_OPTIONS.find(
      (option) => option.toLowerCase() === candidate.trim().toLowerCase(),
    );
    if (!canonical || isSelected(canonical)) return;
    onChange([...tags, canonical]);
    setInput("");
    setHighlight(-1);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, matches.length - 1));
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const choice = highlight > -1 ? matches[highlight] : matches[0];
      if (choice) add(choice);
    } else if (event.key === "Escape") {
      // Escape clears the local input; stop it here so the window-level
      // Escape-to-cancel listener doesn't also discard the whole edit session.
      event.stopPropagation();
      setInput("");
      setHighlight(-1);
    } else if (event.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className={styles.tagField}>
      <div className={styles.tagEditor}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button
              type="button"
              className={styles.tagRemove}
              aria-label={t("members:profileEdit.removeTagLabel", { tag })}
              onClick={() => onChange(tags.filter((entry) => entry !== tag))}
            >
              <FiX size={13} />
            </button>
          </span>
        ))}
        <div className={styles.tagInputWrap}>
          <input
            className={`${styles.inlineInput} ${styles.tagInput}`}
            value={input}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            aria-controls="profile-tag-suggestions"
            placeholder={
              placeholder ?? t("members:profileEdit.searchTagPlaceholder")
            }
            aria-label={t("members:profileEdit.addTagLabel")}
            onChange={(event) => {
              setInput(event.target.value);
              setHighlight(-1);
            }}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {showSuggestions && (
            <div
              id="profile-tag-suggestions"
              role="listbox"
              className={styles.tagSuggest}
            >
              {matches.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={index === highlight}
                  className={`${styles.tagSuggestItem} ${
                    index === highlight ? styles.tagSuggestItemHl : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => add(option)}
                >
                  <span aria-hidden>+</span>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {popular.length > 0 && (
        <div className={styles.tagPopular}>
          <span className={styles.tagPopularLabel}>
            {t("members:profileEdit.popularTagsLabel")}
          </span>
          {popular.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.tagAdd}
              onClick={() => add(option)}
            >
              <span aria-hidden>+</span>
              {option}
            </button>
          ))}
        </div>
      )}
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
  const { t } = useTranslation();
  const active = VISIBILITY_OPTIONS.find((option) => option.value === value);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move selection between radio options (wrapping around) and carry
  // focus with them — the standard ARIA radiogroup keyboard model.
  function handleKey(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % VISIBILITY_OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + VISIBILITY_OPTIONS.length) %
        VISIBILITY_OPTIONS.length;
    }
    const nextOption = VISIBILITY_OPTIONS[nextIndex];
    if (!nextOption) return;
    event.preventDefault();
    onChange(nextOption.value);
    optionRefs.current[nextIndex]?.focus();
  }

  return (
    <div>
      <div
        className={styles.segmented}
        role="radiogroup"
        aria-label={t("members:profileEdit.visibilityGroupLabel")}
      >
        {VISIBILITY_OPTIONS.map((option, index) => {
          const isChecked = value === option.value;
          return (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={isChecked}
              // Roving tabindex: only the checked option is in the tab order;
              // a fallback keeps the first option reachable if none matches.
              tabIndex={isChecked || (!active && index === 0) ? 0 : -1}
              className={`${styles.segment} ${isChecked ? styles.segmentActive : ""}`}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKey(event, index)}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>
      {active && <p className={styles.visHint}>{t(active.hintKey)}</p>}
    </div>
  );
}
