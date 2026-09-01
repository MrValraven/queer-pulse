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
 *
 * Each tag carries an availability count, and a tag that lands on 0 goes inert
 * (`ChipSelect` dims and disables it) — picking it could only empty the grid.
 * Unlike the category chips' totals just above, this number is a LIVE facet:
 * it is counted under the rest of the drawer's filters, so it moves as the
 * member narrows. That is what makes greying a chip out honest here: "nothing
 * under this tag as well", rather than "nothing under this tag ever".
 */
export function CommunitiesTagsFilter({
  selectedTagIds,
  onChange,
  tagCounts,
}: {
  selectedTagIds: string[];
  onChange: (next: string[]) => void;
  /** Curated tag id to how many communities it would yield under the rest of
   *  the current filters (`useDiscoverCommunities`'s `tagCounts`). A tag
   *  missing from the map, or the map itself absent while the first page is
   *  still in flight, shows no badge: "not counted" must never be rendered as
   *  a `0`, which is the state that greys a chip out. */
  tagCounts?: Record<string, number>;
}) {
  const { t } = useTranslation();
  const uid = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const options = useMemo(() => {
    const all = COMMUNITY_TAGS.map((tag) => {
      const label = t(tag.labelKey);
      const count = tagCounts?.[tag.id];
      return {
        value: tag.id,
        label,
        ...(count === undefined
          ? {}
          : {
              count,
              // The badge is aria-hidden, so the chip has to carry the whole
              // phrase as its name: "Book club, 4 communities", never
              // "Book club 4" (which reads as a quantity of book clubs).
              ariaLabel: t("communities:discover.filter.tagWithCount", {
                label,
                count,
              }),
            }),
      };
    });
    return q
      ? all.filter((option) => option.label.toLowerCase().includes(q))
      : all;
  }, [q, t, tagCounts]);

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

      {/* The tray stays mounted so its height can ease open AND closed; the
          grid-rows 0fr-to-1fr wrapper in the stylesheet does the animating
          without measuring, and `inert` keeps the closed tray's search box and
          53 chips out of the tab order and off screen readers. */}
      <div
        className={[styles.tagsPanelWrap, isOpen && styles.tagsPanelWrapOpen]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          id={`${uid}-panel`}
          className={styles.tagsPanelClip}
          inert={!isOpen || undefined}
        >
          <div className={styles.tagsPanel}>
            <SearchInput
              className={styles.tagsSearch}
              value={query}
              onChange={setQuery}
              placeholder={t(
                "communities:discover.filter.tagsSearchPlaceholder",
              )}
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
                <em>
                  {t("communities:discover.filter.tagsNoMatch", { query })}
                </em>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
