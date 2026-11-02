import { useId, type ReactNode } from "react";
import { useLocalStorage } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalAccessFilter } from "./LocalAccessFilter";
import { LocalCategoryFilter } from "./LocalCategoryFilter";
import {
  EntryModeFactGroup,
  LanguageFactGroup,
  PaymentFactGroup,
  PracticeFactGroup,
  type LocalFactGroupProps,
} from "./LocalListingFactFilters";
import { MoreFiltersFieldset } from "./LocalMoreFilters";
import { LocalOwnedByFilter } from "./LocalOwnedByFilter";
import { LocalQuickFilters } from "./LocalQuickFilters";
import { LocalFilterSection } from "./LocalFilterSection";
import type { LocalFilterFieldsProps } from "./LocalFilterFields";
import {
  countLocalSectionSelections,
  DEFAULT_OPEN_LOCAL_SECTIONS,
  isLocalSectionOpenMap,
  localCategoryChipIds,
  type LocalFilterSectionKey,
} from "./localFilterSections";
import { useMoreFilterGroups } from "./useMoreFilterGroups";
import sectionStyles from "./LocalFilterSection.module.css";

/**
 * The desktop filter sidebar beside the results: every group as a
 * collapsible section, the same rows as the members directory's panel. The
 * place types and the one-tap narrowings start open and the rest start
 * shut, so the panel reads as a short menu; which sections are open is
 * remembered on this device (`qp.local.filterSections`). Each header carries
 * the count of selections inside it, so a shut section still shows what is
 * on. The sort control sits above the results, so it is left out here.
 */
export function LocalFilterSidebar(fields: LocalFilterFieldsProps) {
  const { t } = useTranslation();
  const titleIdPrefix = useId();
  const [openSections, setOpenSections] = useLocalStorage<
    Record<LocalFilterSectionKey, boolean>
  >(
    "qp.local.filterSections",
    DEFAULT_OPEN_LOCAL_SECTIONS,
    isLocalSectionOpenMap,
  );
  const { isOnlineScope = false, listingFacts, categories } = fields;
  const activeCounts = countLocalSectionSelections(fields);
  const moreFilterGroups = useMoreFilterGroups({
    listingFacts,
    isOnlineScope,
    categories,
  });
  const titleId = (key: LocalFilterSectionKey) => `${titleIdPrefix}-${key}`;

  const section = (
    key: LocalFilterSectionKey,
    titleKey: string,
    children: ReactNode,
  ) => (
    <LocalFilterSection
      key={key}
      title={t(titleKey)}
      headingId={titleId(key)}
      isOpen={openSections[key]}
      onToggle={() =>
        setOpenSections((previous) => ({ ...previous, [key]: !previous[key] }))
      }
      activeCount={activeCounts[key]}
    >
      {children}
    </LocalFilterSection>
  );

  const factProps = (key: LocalFilterSectionKey): LocalFactGroupProps => ({
    listingFacts,
    onToggleListingFact: fields.onToggleListingFact,
    counts: fields.chipCounts.listingFacts,
    isLoadedSetComplete: fields.isLoadedSetComplete,
    sectionTitleId: titleId(key),
  });

  return (
    <div className={sectionStyles.sectionList}>
      {section(
        "placeType",
        isOnlineScope
          ? "marketing:local.filter.categoryLabelOnline"
          : "marketing:local.filter.categoryLabel",
        <LocalCategoryFilter
          categories={categories}
          onToggleCategory={fields.onToggleCategory}
          onClearCategories={fields.onClearCategories}
          categoryCounts={fields.categoryCounts}
          isLoadedSetComplete={fields.isLoadedSetComplete}
          categoryIds={localCategoryChipIds(isOnlineScope, fields.isAdultShown)}
          hasSwatches={!isOnlineScope}
          sectionTitleId={titleId("placeType")}
        />,
      )}
      {section(
        "quick",
        "marketing:local.filter.quickFiltersLabel",
        <LocalQuickFilters
          showOpenNow={!isOnlineScope}
          openNow={fields.openNow}
          onToggleOpenNow={fields.onToggleOpenNow}
          showOutAndAbout={
            !isOnlineScope && fields.onToggleOutAndAbout !== undefined
          }
          isOutAndAbout={fields.isOutAndAbout === true}
          onToggleOutAndAbout={fields.onToggleOutAndAbout}
          safeOnly={fields.safeOnly}
          onToggleSafeOnly={fields.onToggleSafeOnly}
          chipCounts={fields.chipCounts}
          isLoadedSetComplete={fields.isLoadedSetComplete}
          showAdult={isOnlineScope && fields.canShowAdult === true}
          isAdultShown={fields.isAdultShown}
          onToggleAdult={fields.onToggleAdult}
          sectionTitleId={titleId("quick")}
        />,
      )}
      {section(
        "ownedBy",
        "marketing:local.filter.ownedByLabel",
        <LocalOwnedByFilter
          owned={fields.owned}
          onToggleOwned={fields.onToggleOwned}
          sectionTitleId={titleId("ownedBy")}
        />,
      )}
      {!isOnlineScope &&
        section(
          "entry",
          "marketing:local.filter.entryLabel",
          <EntryModeFactGroup {...factProps("entry")} />,
        )}
      {!isOnlineScope &&
        section(
          "pay",
          "marketing:local.filter.payLabel",
          <PaymentFactGroup {...factProps("pay")} />,
        )}
      {section(
        "languages",
        "marketing:local.filter.langLabel",
        <LanguageFactGroup {...factProps("languages")} />,
      )}
      {section(
        "practices",
        "marketing:local.filter.practiceLabel",
        <PracticeFactGroup
          {...factProps("practices")}
          isOnlineScope={isOnlineScope}
        />,
      )}
      {!isOnlineScope &&
        section(
          "access",
          "marketing:local.filter.accessLabel",
          <LocalAccessFilter
            access={fields.access}
            onToggleAccess={fields.onToggleAccess}
            accessCounts={fields.chipCounts.access}
            isLoadedSetComplete={fields.isLoadedSetComplete}
            sectionTitleId={titleId("access")}
          />,
        )}
      {moreFilterGroups.length > 0 &&
        section(
          "more",
          "marketing:local.filter.moreFilters.label",
          <MoreFiltersFieldset
            {...factProps("more")}
            groups={moreFilterGroups}
          />,
        )}
    </div>
  );
}
