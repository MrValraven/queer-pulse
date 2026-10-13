import { useId, useState } from "react";
import { m } from "motion/react";
import { FiSliders } from "react-icons/fi";
import { Collapse, useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  type DirectoryListingFactFilters,
  type ListingFactCounts,
  type ListingFactFilterChange,
} from "./directoryListingFactFilters";
import { useListingAttributeVocabulary } from "./listBusiness/api/useListingAttributeVocabulary";
import {
  attributeGroupLabel,
  attributeLabel,
  filterableAttributeGroupsFor,
  OTHER_ATTRIBUTE_GROUP_ID,
} from "./listBusiness/listingAttributes.data";
import { LocalFactChip } from "./LocalListingFactFilters";
import s from "./LocalFilterBar.module.css";

/**
 * "Show more filters": the attributes of the chosen place types first, then
 * "Around the place" and "Pricing" underneath (with none chosen, those two
 * alone; the online equivalents on the Online tab), each once and none of
 * them sensitive (`filterableAttributeGroupsFor`). A disclosure inside the
 * drawer and the sheet, opened on its own when an attribute filter is
 * already on. A chosen attribute the current place types no longer offer
 * stays listed so it can be turned off.
 */
export function LocalMoreFilters({
  listingFacts,
  onToggleListingFact,
  counts,
  isLoadedSetComplete,
  isOnlineScope,
  categories,
}: {
  listingFacts: DirectoryListingFactFilters;
  onToggleListingFact: (change: ListingFactFilterChange) => void;
  counts: ListingFactCounts;
  isLoadedSetComplete: boolean;
  isOnlineScope: boolean;
  /** The chosen place types (`?cat=`). */
  categories: readonly string[];
}) {
  const { t } = useTranslation();
  const vocabulary = useListingAttributeVocabulary();
  const glide = useRefineGlide();
  const panelId = useId();
  // Opens on its own whenever attribute filters appear (on mount, or a
  // back or forward step that brings `?attr=` back), and closes only when
  // the visitor closes it. Adjusted during render, React's pattern for state
  // that follows a prop.
  const hasAttributeFilters = listingFacts.attributes.length > 0;
  const [isOpen, setIsOpen] = useState(hasAttributeFilters);
  const [hadAttributeFilters, setHadAttributeFilters] =
    useState(hasAttributeFilters);
  if (hasAttributeFilters !== hadAttributeFilters) {
    setHadAttributeFilters(hasAttributeFilters);
    if (hasAttributeFilters) setIsOpen(true);
  }
  const groups = filterableAttributeGroupsFor(vocabulary, {
    categories,
    isOnlineScope,
  });
  const shown = new Set(groups.flatMap((group) => group.attributes));
  const strays = listingFacts.attributes.filter((slug) => !shown.has(slug));
  const allGroups =
    strays.length > 0
      ? [...groups, { id: OTHER_ATTRIBUTE_GROUP_ID, attributes: strays }]
      : groups;
  if (allGroups.length === 0) return null;
  const chosenCount = listingFacts.attributes.length;

  return (
    <div className={s.moreFilters}>
      <button
        type="button"
        className={s.moreFiltersToggle}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiSliders aria-hidden />
        {t(
          isOpen
            ? "marketing:local.filter.moreFilters.hide"
            : "marketing:local.filter.moreFilters.show",
        )}
        {chosenCount > 0 && (
          <span className={s.count} aria-hidden="true">
            {chosenCount}
          </span>
        )}
      </button>
      <Collapse isOpen={isOpen}>
        <fieldset id={panelId} className={s.accessGroup}>
          <legend className={s.groupLabel}>
            {t("marketing:local.filter.moreFilters.label")}
          </legend>
          <p className={s.accessNote}>
            {t("marketing:local.filter.moreFilters.note")}
          </p>
          {allGroups.map((group) => {
            const headingId = `${panelId}-${group.id}`;
            return (
              <div
                key={group.id}
                className={s.moreFiltersGroup}
                role="group"
                aria-labelledby={headingId}
              >
                <span id={headingId} className={s.moreFiltersHeading}>
                  {attributeGroupLabel(t, group.id)}
                </span>
                <m.div {...glide.row} className={s.accessChips}>
                  {group.attributes.map((slug) => (
                    <LocalFactChip
                      key={slug}
                      listingFacts={listingFacts}
                      isLoadedSetComplete={isLoadedSetComplete}
                      onToggle={onToggleListingFact}
                      label={attributeLabel(t, slug)}
                      isOn={listingFacts.attributes.includes(slug)}
                      change={{ kind: "attribute", slug }}
                      count={counts.attributes[slug] ?? 0}
                    />
                  ))}
                </m.div>
              </div>
            );
          })}
        </fieldset>
      </Collapse>
    </div>
  );
}
