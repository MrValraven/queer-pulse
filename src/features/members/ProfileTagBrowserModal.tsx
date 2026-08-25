import { useMemo, useState } from "react";
import { FiCheck, FiPlus, FiSearch } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PROFILE_TAG_CATEGORIES } from "./profileTags.data";
import styles from "./ProfileTagBrowserModal.module.css";

/**
 * The whole tag vocabulary, grouped by category, one click per tag.
 *
 * The inline `TagEditor` only ever reveals the vocabulary a few words at a
 * time (six popular chips, then type-ahead), which means a member has to
 * already know the word exists to find it. This modal is the browse path:
 * every category, every tag, add or remove in place.
 *
 * Picks are written straight through to the draft as they happen, so closing
 * the modal by any route (Done, the X, Escape, the scrim) keeps them.
 */
export function ProfileTagBrowserModal({
  tags,
  onChange,
  onClose,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const selectedTags = useMemo(
    () => new Set(tags.map((tag) => tag.toLowerCase())),
    [tags],
  );

  // Filtering keeps the category structure and drops categories that end up
  // empty, so a search never leaves a bare heading behind.
  const visibleCategories = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();
    if (!normalisedQuery) return PROFILE_TAG_CATEGORIES;
    return PROFILE_TAG_CATEGORIES.map((category) => ({
      ...category,
      tags: category.tags.filter((tag) =>
        tag.toLowerCase().includes(normalisedQuery),
      ),
    })).filter((category) => category.tags.length > 0);
  }, [query]);

  function toggle(tag: string) {
    if (selectedTags.has(tag.toLowerCase())) {
      onChange(
        tags.filter((entry) => entry.toLowerCase() !== tag.toLowerCase()),
      );
    } else {
      onChange([...tags, tag]);
    }
  }

  return (
    <Modal
      wide
      title={t("members:profileEdit.tagBrowser.title")}
      sub={t("members:profileEdit.tagBrowser.selectedCount", {
        count: tags.length,
      })}
      onClose={onClose}
      footer={
        <div className={styles.footRow}>
          <Button variant="primary" onClick={onClose}>
            {t("members:profileEdit.tagBrowser.done")}
          </Button>
        </div>
      }
    >
      <div className={styles.searchRow}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          className={styles.searchInput}
          type="search"
          value={query}
          aria-label={t("members:profileEdit.tagBrowser.searchLabel")}
          placeholder={t("members:profileEdit.tagBrowser.searchPlaceholder")}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {visibleCategories.length === 0 ? (
        <p className={styles.empty}>
          {t("members:profileEdit.tagBrowser.noMatches", {
            query: query.trim(),
          })}
        </p>
      ) : (
        <div className={styles.categories}>
          {visibleCategories.map((category) => (
            <section key={category.id} className={styles.category}>
              <h4 className={styles.categoryTitle}>{t(category.labelKey)}</h4>
              <div className={styles.chipRow}>
                {category.tags.map((tag) => {
                  const isSelected = selectedTags.has(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={isSelected}
                      className={`${styles.chip} ${
                        isSelected ? styles.chipOn : ""
                      }`}
                      onClick={() => toggle(tag)}
                    >
                      {isSelected ? (
                        <FiCheck size={13} aria-hidden />
                      ) : (
                        <FiPlus size={13} aria-hidden />
                      )}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </Modal>
  );
}
