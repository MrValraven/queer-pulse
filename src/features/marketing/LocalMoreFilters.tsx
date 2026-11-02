import { useId, useState } from "react";
import { m } from "motion/react";
import { FiSliders } from "react-icons/fi";
import { Collapse, useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  attributeGroupLabel,
  attributeLabel,
} from "./listBusiness/listingAttributes.data";
import {
  LocalFactChip,
  type LocalFactGroupProps,
} from "./LocalListingFactFilters";
import {
  useMoreFilterGroups,
  type MoreFilterGroup,
} from "./useMoreFilterGroups";
import s from "./LocalFilterBar.module.css";

/**
 * The attribute groups as one named fieldset: its note, then each group's
 * heading over its chips. Inside a desktop sidebar section (`sectionTitleId`)
 * the section header names the fieldset and the legend is left out.
 */
export function MoreFiltersFieldset({
  id,
  groups,
  listingFacts,
  onToggleListingFact,
  counts,
  isLoadedSetComplete,
  sectionTitleId,
}: LocalFactGroupProps & { id?: string; groups: MoreFilterGroup[] }) {
  const { t } = useTranslation();
  const glide = useRefineGlide();
  const headingIdPrefix = useId();
  return (
    <fieldset
      id={id}
      className={[s.accessGroup, sectionTitleId && s.flush]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={sectionTitleId}
    >
      {!sectionTitleId && (
        <legend className={s.groupLabel}>
          {t("marketing:local.filter.moreFilters.label")}
        </legend>
      )}
      <p className={s.accessNote}>
        {t("marketing:local.filter.moreFilters.note")}
      </p>
      {groups.map((group) => {
        const headingId = `${headingIdPrefix}-${group.id}`;
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
  );
}

/**
 * "Show more filters": the attribute groups (`useMoreFilterGroups`) behind a
 * disclosure inside the drawer and the sheet, opened on its own when an
 * attribute filter is already on. The desktop sidebar shows the same
 * fieldset as a section of its own.
 */
export function LocalMoreFilters({
  isOnlineScope,
  categories,
  ...groupProps
}: LocalFactGroupProps & {
  isOnlineScope: boolean;
  /** The chosen place types (`?cat=`). */
  categories: readonly string[];
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const { listingFacts } = groupProps;
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
  const groups = useMoreFilterGroups({
    listingFacts,
    isOnlineScope,
    categories,
  });
  if (groups.length === 0) return null;
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
        <MoreFiltersFieldset {...groupProps} id={panelId} groups={groups} />
      </Collapse>
    </div>
  );
}
