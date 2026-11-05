import { useMemo, useState } from "react";
import { ChipSelect, SearchInput } from "../../shared/components/ui";
import {
  FilterSection,
  filterPageClassNames,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMMUNITY_TAGS } from "./communityTags.data";
import styles from "./CommunitiesPage.module.css";

/**
 * The "Tags" section of the communities filter sidebar: a search box over the
 * full curated tag vocabulary, then the matching tags as a multi-select
 * `ChipSelect`. The same "search narrows a curated pool" pattern the member
 * directory's "What they do" section uses (`FilterProfessions.tsx`). The
 * section itself is the disclosure, so the 53 tags stay folded until a member
 * opens it, and the sidebar column scrolls once it runs taller than the
 * viewport.
 *
 * Each tag carries an availability count, and a tag that lands on 0 goes inert
 * (`ChipSelect` dims and disables it): picking it could only empty the grid.
 * Unlike the category totals above it, this number is a LIVE facet, counted
 * under the rest of the sidebar's filters, so it moves as the member narrows
 * and dims while it still describes the previous run.
 */
export function CommunitiesTagsFilter({
  selectedTagIds,
  onChange,
  tagCounts,
  isCountStale,
  isOpen,
  onToggle,
}: {
  selectedTagIds: string[];
  onChange: (next: string[]) => void;
  /** Curated tag id to how many communities it would yield under the rest of
   *  the current filters (`useDiscoverCommunities`'s `tagCounts`). A tag
   *  missing from the map, or the map itself absent while the first page is
   *  still in flight, shows no badge: "not counted" must never be rendered as
   *  a `0`, which is the state that greys a chip out. */
  tagCounts?: Record<string, number>;
  /** The counts describe the previous filter run while a new one loads. */
  isCountStale: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const normalisedQuery = query.trim().toLowerCase();

  const options = useMemo(() => {
    const allOptions = COMMUNITY_TAGS.map((tag) => {
      const label = t(tag.labelKey);
      const count = tagCounts?.[tag.id];
      return {
        value: tag.id,
        label,
        ...(count === undefined
          ? {}
          : {
              count,
              // The badge is aria-hidden, so the chip carries the whole
              // phrase as its name: "Book club, 4 communities".
              ariaLabel: t("communities:discover.filter.tagWithCount", {
                label,
                count,
              }),
            }),
      };
    });
    return normalisedQuery
      ? allOptions.filter((option) =>
          option.label.toLowerCase().includes(normalisedQuery),
        )
      : allOptions;
  }, [normalisedQuery, t, tagCounts]);

  const selected = new Set(selectedTagIds);
  const toggleTag = (tagId: string) =>
    onChange(
      selected.has(tagId)
        ? selectedTagIds.filter((selectedId) => selectedId !== tagId)
        : [...selectedTagIds, tagId],
    );

  return (
    <FilterSection
      title={t("communities:discover.filter.tagsTitle")}
      open={isOpen}
      onToggle={onToggle}
      activeCount={selectedTagIds.length}
    >
      <SearchInput
        className={styles.tagsSectionSearch}
        value={query}
        onChange={setQuery}
        placeholder={t("communities:discover.filter.tagsSearchPlaceholder")}
        ariaLabel={t("communities:discover.filter.tagsAriaLabel")}
      />
      {options.length > 0 ? (
        <ChipSelect
          className={[
            styles.tagsChips,
            isCountStale && filterPageClassNames.chipsStale,
          ]
            .filter(Boolean)
            .join(" ")}
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
    </FilterSection>
  );
}
