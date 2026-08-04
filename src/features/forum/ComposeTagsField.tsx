import { useState, type KeyboardEvent } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import modalStyles from "./ComposeThreadModal.module.css";
import styles from "./ComposeTagsField.module.css";

const MAX_TAGS = 5;
const MAX_TAG_LEN = 24;

/** Normalize one raw token the way the backend does: trim, drop a leading `#`,
 *  lowercase, clamp length. Returns "" for empties so they can be dropped. */
function normalizeTag(raw: string): string {
  return raw.trim().replace(/^#+/, "").toLowerCase().slice(0, MAX_TAG_LEN);
}

/**
 * Chip-entry tags input for the compose modal: type a tag, Enter/comma commits
 * it, Backspace on an empty field removes the last one. Normalized + deduped,
 * capped at five. Lifts the tag array up via `onChange`.
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

  function commit(raw: string) {
    const tag = normalizeTag(raw);
    setDraft("");
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    onChange([...tags, tag]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className={modalStyles.field}>
      <span className={modalStyles.fieldLabel}>
        {t("forum:compose.tagsFieldLabel")}
      </span>
      <div className={styles.tagsInput}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tagChip}>
            #{tag}
            <button
              type="button"
              className={styles.tagChipRemove}
              onClick={() => onChange(tags.filter((existing) => existing !== tag))}
              aria-label={t("forum:compose.removeTagAria", { tag })}
            >
              <FiX aria-hidden />
            </button>
          </span>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            className={styles.tagsEntry}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => commit(draft)}
            placeholder={tags.length ? "" : t("forum:compose.tagsPlaceholder")}
            aria-label={t("forum:compose.tagsFieldLabel")}
            autoComplete="off"
          />
        )}
      </div>
      <span className={styles.tagsHint}>
        {t("forum:compose.tagsHint", { max: MAX_TAGS })}
      </span>
    </div>
  );
}
