import { useMemo, useState, type KeyboardEvent } from "react";
import { FiGrid, FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ComposeTagsField.module.css";
import { ForumTagBrowseList } from "./ForumTagBrowseList";
import { FORUM_TAG_OPTIONS, POPULAR_FORUM_TAGS } from "./forumTags.data";

const MAX_TAGS = 5;
const MAX_SUGGESTIONS = 6;

/**
 * Tag picker for the thread's "Edit tags" modal: choose from the curated
 * vocabulary in `forumTags.data.ts`, search it, quick-add from a popular row,
 * or expand the full grouped list. The × on a chip removes one.
 *
 * It used to serve the compose modal as well. That composer is gone, and the
 * full page at `/forum/new` has its own `ComposeTagsSection` — so this is now
 * the editing half alone, with its own field styles (see the module CSS).
 *
 * Only words in the vocabulary can be added, so the archive stays filed under
 * one set of words rather than drifting into near-duplicates that split a topic
 * across two filter links. Tags that predate the list still render as chips and
 * can still be removed, they just can't be re-added.
 *
 * The browse list expands INLINE rather than in its own modal: the call site
 * is already a modal, and stacking a second one over it to pick a word is a
 * heavier escape path than the choice deserves.
 */
export function ComposeTagsField({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const isAtCap = tags.length >= MAX_TAGS;

  const matches = useMemo(() => {
    const query = draft.trim().replace(/^#+/, "").toLowerCase();
    if (!query) return [];
    return FORUM_TAG_OPTIONS.filter(
      (option) => option.includes(query) && !tags.includes(option),
    ).slice(0, MAX_SUGGESTIONS);
  }, [draft, tags]);

  const popular = useMemo(
    () => POPULAR_FORUM_TAGS.filter((option) => !tags.includes(option)),
    [tags],
  );

  const showSuggestions = isFocused && draft.trim().length > 0;

  function add(candidate: string) {
    if (!FORUM_TAG_OPTIONS.includes(candidate)) return;
    if (tags.includes(candidate) || isAtCap) return;
    onChange([...tags, candidate]);
    setDraft("");
    setHighlight(-1);
  }

  function remove(tag: string) {
    onChange(tags.filter((existing) => existing !== tag));
  }

  function toggle(tag: string) {
    if (tags.includes(tag)) remove(tag);
    else add(tag);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, matches.length - 1));
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" || event.key === ",") {
      // Enter only ever picks a suggestion. With nothing matching it does
      // nothing, which is what keeps the vocabulary closed.
      event.preventDefault();
      const choice = highlight > -1 ? matches[highlight] : matches[0];
      if (choice) add(choice);
    } else if (event.key === "Escape" && draft) {
      // Escape clears the local query; stop it here so the modal's own
      // Escape-to-close doesn't also discard the whole edit.
      event.stopPropagation();
      setDraft("");
      setHighlight(-1);
    }
    // Backspace deliberately does NOT remove the previous tag. Holding it to
    // clear what you typed would run on into the chips you already committed
    // and silently delete them; the × on each tag is the only way to remove one.
  }

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>
        {t("forum:compose.tagsFieldLabel")}
      </span>
      <div className={styles.tagsInputWrap}>
        <div className={styles.tagsInput}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tagChip}>
              #{tag}
              <button
                type="button"
                className={styles.tagChipRemove}
                onClick={() => remove(tag)}
                aria-label={t("forum:compose.removeTagAria", { tag })}
              >
                <FiX aria-hidden />
              </button>
            </span>
          ))}
          {!isAtCap && (
            <input
              className={styles.tagsEntry}
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setHighlight(-1);
              }}
              onKeyDown={onKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                tags.length ? "" : t("forum:compose.tagsPlaceholder")
              }
              aria-label={t("forum:compose.tagsSearchLabel")}
              autoComplete="off"
            />
          )}
        </div>
        {showSuggestions && (
          <div className={styles.tagSuggest} role="listbox">
            {matches.length === 0 ? (
              <p className={styles.tagSuggestEmpty}>
                {t("forum:compose.tagsNoMatch", { query: draft.trim() })}
              </p>
            ) : (
              matches.map((option, index) => (
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
                  <FiPlus aria-hidden />#{option}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className={styles.tagPopular}>
        {!isAtCap && popular.length > 0 && (
          <>
            <span className={styles.tagPopularLabel}>
              {t("forum:compose.popularTagsLabel")}
            </span>
            {popular.map((option) => (
              <button
                key={option}
                type="button"
                className={styles.tagAdd}
                onClick={() => add(option)}
                aria-label={t("forum:compose.addTagAria", { tag: option })}
              >
                <FiPlus aria-hidden />#{option}
              </button>
            ))}
          </>
        )}
        {/* The popular chips and the type-ahead only ever reveal a sliver of
            the vocabulary, so anyone who doesn't already know a tag exists
            can't find it. This expands the full grouped list. */}
        <button
          type="button"
          className={`${styles.tagAdd} ${styles.tagBrowseAll}`}
          onClick={() => setIsBrowseOpen((open) => !open)}
          aria-expanded={isBrowseOpen}
        >
          <FiGrid aria-hidden />
          {t(
            isBrowseOpen
              ? "forum:compose.hideTagList"
              : "forum:compose.browseTags",
          )}
        </button>
      </div>

      {isBrowseOpen && (
        <ForumTagBrowseList tags={tags} isAtCap={isAtCap} onToggle={toggle} />
      )}

      <span className={styles.tagsHint}>
        {t("forum:compose.tagsHint", { max: MAX_TAGS })}
      </span>
    </div>
  );
}
