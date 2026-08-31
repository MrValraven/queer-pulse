import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { FiGrid, FiPlus, FiX } from "react-icons/fi";
import { RadioCardGroup } from "../../shared/components/ui";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRONOUN_PRESETS } from "../../shared/identity/pronouns";
import { VISIBILITY_OPTIONS } from "./profileEdit.data";
import { ProfileTagBrowserModal } from "./ProfileTagBrowserModal";
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
    const element = ref.current;
    if (!element) return;
    const fit = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };
    fit();
    // A one-shot measure freezes a stale height when the textarea's width or the
    // font changes after mount — e.g. measured mid-entrance in the narrow mobile
    // editor, or before the web font loads — leaving a tall empty box. Recompute
    // on width changes (ResizeObserver) and once fonts are ready (which reflows
    // the text but not the explicitly-set box height, so the observer misses it).
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts) {
      void document.fonts.ready.then(() => {
        if (!cancelled) fit();
      });
    }
    return () => {
      cancelled = true;
      observer.disconnect();
    };
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

/** Quick-pick pronoun chips (multi-select) with a free-text add for anything custom. */
export function PronounPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const [customInput, setCustomInput] = useState("");
  const presets = PRONOUN_PRESETS as readonly string[];
  const custom = value.filter((entry) => !presets.includes(entry));

  function toggle(pronoun: string) {
    onChange(
      value.includes(pronoun)
        ? value.filter((entry) => entry !== pronoun)
        : [...value, pronoun],
    );
  }
  function addCustom() {
    const trimmed = customInput.trim();
    setCustomInput("");
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  }

  return (
    <div className={styles.chips}>
      {PRONOUN_PRESETS.map((pronoun) => (
        <button
          key={pronoun}
          type="button"
          className={`${styles.chip} ${value.includes(pronoun) ? styles.chipSelected : ""}`}
          aria-pressed={value.includes(pronoun)}
          onClick={() => toggle(pronoun)}
        >
          {pronoun}
        </button>
      ))}
      {custom.map((entry) => (
        <button
          key={entry}
          type="button"
          className={`${styles.chip} ${styles.chipSelected}`}
          aria-pressed
          onClick={() => toggle(entry)}
        >
          {entry}
        </button>
      ))}
      <input
        className={`${styles.inlineInput} ${styles.customPronoun}`}
        value={customInput}
        placeholder={t("members:profileEdit.customPronounPlaceholder")}
        aria-label={t("members:profileEdit.customPronounsLabel")}
        onChange={(event) => setCustomInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addCustom();
          }
        }}
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
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

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
    }
    // Backspace deliberately does NOT remove the previous tag. Holding it to
    // clear what you typed would run on into the chips you already picked and
    // silently delete them; the × on each tag is the only way to remove one.
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
                  <FiPlus aria-hidden />
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.tagPopular}>
        {popular.length > 0 && (
          <>
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
                <FiPlus aria-hidden />
                {option}
              </button>
            ))}
          </>
        )}
        {/* The popular chips and the type-ahead only ever reveal a sliver of the
            vocabulary, so anyone who doesn't already know a tag exists can't
            find it. This opens the full grouped list. */}
        <button
          type="button"
          className={`${styles.tagAdd} ${styles.tagBrowseAll}`}
          onClick={() => setIsBrowserOpen(true)}
        >
          <FiGrid aria-hidden />
          {t("members:profileEdit.tagBrowser.open")}
        </button>
      </div>

      {isBrowserOpen && (
        <ProfileTagBrowserModal
          tags={tags}
          onChange={onChange}
          onClose={() => setIsBrowserOpen(false)}
        />
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
