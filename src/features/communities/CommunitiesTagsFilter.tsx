import { useId, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ChipSelect, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMMUNITY_TAGS } from "./communityTags.data";
import styles from "./CommunitiesPage.module.css";

/**
 * The Discover page's tags filter: a disclosure chip (matching the category
 * chips it sits beside) that opens onto the full curated tag vocabulary — a
 * search-narrowed `ChipSelect`, the same "search widens/narrows a curated
 * multi-select pool" pattern the member directory's "What they do" filter
 * uses (`FilterProfessions.tsx`). Kept collapsed by default since 53 tags
 * would otherwise dominate the toolbar above the grid; open, the tray
 * expands in flow and pushes the grid down (see `.tagsPanel`) rather than
 * floating over the cards.
 */
export function CommunitiesTagsFilter({
  selectedTagIds,
  onChange,
}: {
  selectedTagIds: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const uid = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const options = useMemo(() => {
    const all = COMMUNITY_TAGS.map((tag) => ({
      value: tag.id,
      label: t(tag.labelKey),
    }));
    return q
      ? all.filter((option) => option.label.toLowerCase().includes(q))
      : all;
  }, [q, t]);

  const selected = new Set(selectedTagIds);
  const toggleTag = (id: string) =>
    onChange(
      selected.has(id)
        ? selectedTagIds.filter((tagId) => tagId !== id)
        : [...selectedTagIds, id],
    );

  return (
    <div className={styles.tagsFilter}>
      <button
        type="button"
        className={[styles.chip, selectedTagIds.length > 0 && styles.chipActive]
          .filter(Boolean)
          .join(" ")}
        aria-expanded={isOpen}
        aria-controls={`${uid}-panel`}
        onClick={() => setIsOpen((value) => !value)}
      >
        {t("communities:discover.filter.tagsTitle")}
        {selectedTagIds.length > 0 && (
          <span className={styles.chipCount}>{selectedTagIds.length}</span>
        )}
        {isOpen ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
      </button>

      {isOpen && (
        <div id={`${uid}-panel`} className={styles.tagsPanel}>
          <SearchInput
            className={styles.tagsSearch}
            value={query}
            onChange={setQuery}
            placeholder={t("communities:discover.filter.tagsSearchPlaceholder")}
            ariaLabel={t("communities:discover.filter.tagsAriaLabel")}
          />
          {options.length > 0 ? (
            <ChipSelect
              className={styles.tagsChips}
              label={t("communities:discover.filter.tagsAriaLabel")}
              options={options}
              selected={selected}
              onToggle={toggleTag}
            />
          ) : (
            <p className={styles.tagsNoMatch}>
              <em>{t("communities:discover.filter.tagsNoMatch", { query })}</em>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
