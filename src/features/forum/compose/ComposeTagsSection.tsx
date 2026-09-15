import { useId, useState, type KeyboardEvent } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COMPOSE_TAG_LIMIT } from "./composeThread.types";
import styles from "./ComposeTagsSection.module.css";

// ── Tags ────────────────────────────────────────────────────────────────────
// A chip box with the input sitting inside it, a counter, and the suggestions
// the draft's category makes.
//
// WHY NOT `ComposeTagsField` (src/features/forum/ComposeTagsField.tsx): that
// field is a CLOSED vocabulary. It only ever adds a word already in
// `FORUM_TAG_OPTIONS`, and its Enter key deliberately does nothing when
// nothing matches, which is the whole point of it. The full-page composer is
// open entry by contract: `addTag(raw)` runs whatever was typed through
// `normalizeTag` and keeps it. It also takes `(tags, onChange)` rather than the
// add/remove setters the page holds, carries no n/5 counter, sources its
// suggestions from `POPULAR_FORUM_TAGS` instead of the per-category
// `TAG_SUGGESTIONS` the hook derives, and dresses itself as a modal field,
// which is where its one remaining call site lives.
// Four mismatches, one of them the behaviour that field exists for.

/** The keys that commit whatever is in the input. */
const COMMIT_KEYS = ["Enter", ",", "Tab"];

export interface ComposeTagsSectionProps {
  /** The tags on the draft, without their leading `#`. */
  tags: readonly string[];
  /** Adds whatever was typed. Normalizing, de-duplicating and capping all
   *  happen in `addTag`, so nothing here validates. */
  onAddTag: (raw: string) => void;
  onRemoveTag: (tag: string) => void;
  /** Tags worth offering for the draft's category, already filtered by the
   *  hook to ones not yet chosen. */
  suggestedTags: readonly string[];
}

export function ComposeTagsSection({
  tags,
  onAddTag,
  onRemoveTag,
  suggestedTags,
}: ComposeTagsSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const inputHintId = useId();
  const [draft, setDraft] = useState("");
  const isAtLimit = tags.length >= COMPOSE_TAG_LIMIT;

  function commitDraft() {
    if (!draft.trim()) return;
    onAddTag(draft);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (COMMIT_KEYS.includes(event.key)) {
      // Tab only commits when there is something to commit, so an empty input
      // still moves focus on.
      if (event.key === "Tab" && !draft.trim()) return;
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Escape" && draft) {
      // Clear what was typed, and stop here: the page's own Escape handling
      // should not also act on a keystroke that meant "undo this word".
      event.stopPropagation();
      setDraft("");
    }
    // Backspace deliberately does NOT remove the previous tag. Holding it to
    // clear the input runs on into chips that were already committed and
    // deletes them silently; the × on each chip is the only way out.
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          {t("forum:composePage.section.tags.title")}
        </h2>
        <span className={styles.optional}>
          {t("forum:composePage.section.optional")}
        </span>
        <p className={styles.hint}>
          {t("forum:composePage.section.tags.hint")}
        </p>
        <span className={styles.counter} aria-hidden>
          {t("forum:composePage.tags.counter", {
            count: tags.length,
            max: COMPOSE_TAG_LIMIT,
          })}
        </span>
      </div>

      <div className={styles.box}>
        {tags.map((tag) => (
          <span key={tag} className={styles.chip}>
            #{tag}
            <button
              type="button"
              className={styles.chipRemove}
              onClick={() => onRemoveTag(tag)}
              aria-label={t("forum:compose.removeTagAria", { tag })}
            >
              <FiX aria-hidden />
            </button>
          </span>
        ))}
        {isAtLimit ? (
          <span className={styles.full}>
            {t("forum:composePage.tags.full", { max: COMPOSE_TAG_LIMIT })}
          </span>
        ) : (
          <input
            type="text"
            className={styles.entry}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={commitDraft}
            placeholder={t("forum:composePage.tags.placeholder")}
            aria-label={t("forum:composePage.tags.inputLabel")}
            aria-describedby={inputHintId}
            autoComplete="off"
          />
        )}
      </div>
      <p id={inputHintId} className={styles.inputHint}>
        {t("forum:composePage.tags.inputHint", { max: COMPOSE_TAG_LIMIT })}
      </p>

      {!isAtLimit && suggestedTags.length > 0 && (
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>
            {t("forum:composePage.tags.suggestLabel")}
          </span>
          {suggestedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.suggestion}
              onClick={() => onAddTag(tag)}
              aria-label={t("forum:compose.addTagAria", { tag })}
            >
              <FiPlus aria-hidden />#{tag}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
