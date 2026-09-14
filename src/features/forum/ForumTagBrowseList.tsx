import { FiCheck, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ComposeTagsField.module.css";
import { FORUM_TAG_CATEGORIES } from "./forumTags.data";

/**
 * The whole forum tag vocabulary, grouped by category, one click per tag.
 *
 * `ComposeTagsField` only ever reveals the vocabulary a few words at a time
 * (six popular chips, then type-ahead), which means you have to already know a
 * word exists to find it. This is the browse path: every category, every tag,
 * add or remove in place.
 *
 * It scrolls inside its own box so expanding it never pushes the modal's Save
 * button off the bottom of the screen.
 */
export function ForumTagBrowseList({
  tags,
  isAtCap,
  onToggle,
}: {
  tags: string[];
  isAtCap: boolean;
  onToggle: (tag: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.browseList}>
      {FORUM_TAG_CATEGORIES.map((category) => (
        <section key={category.id} className={styles.browseCategory}>
          <h4 className={styles.browseCategoryTitle}>{t(category.labelKey)}</h4>
          <div className={styles.browseChipRow}>
            {category.tags.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={isSelected}
                  // At the five-tag cap the only move left is to take one off,
                  // so unselected chips go quiet rather than failing silently.
                  disabled={isAtCap && !isSelected}
                  className={`${styles.browseChip} ${
                    isSelected ? styles.browseChipOn : ""
                  }`}
                  onClick={() => onToggle(tag)}
                >
                  {isSelected ? (
                    <FiCheck size={13} aria-hidden />
                  ) : (
                    <FiPlus size={13} aria-hidden />
                  )}
                  #{tag}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
