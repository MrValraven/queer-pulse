import type { ReactNode } from "react";
import { RefineSplit } from "../../shared/components/ui";
import { LocalAccessFilter } from "./LocalAccessFilter";
import { LocalCategoryFilter } from "./LocalCategoryFilter";
import { LocalFilterSidebar } from "./LocalFilterSidebar";
import { LocalListingFactFilters } from "./LocalListingFactFilters";
import { LocalMoreFilters } from "./LocalMoreFilters";
import { LocalOwnedByFilter } from "./LocalOwnedByFilter";
import { LocalQuickFilters } from "./LocalQuickFilters";
import { LocalSortFilter } from "./LocalSortFilter";
import { localCategoryChipIds } from "./localFilterSections";
import type { LocalFilterFieldsProps } from "./LocalFilterFields";
import s from "./LocalFilterBar.module.css";

/**
 * How the groups are laid out. `"drawer"` is the full screen map's Refine
 * drawer, where the fact bands pair up once the drawer is wide. `"stacked"`
 * is the mobile Filters sheet: the same groups as one plain stack. `"sidebar"`
 * is the desktop filter sidebar beside the results: a plain stack too, with
 * the sort control left out, since it sits above the results there, and
 * every group a collapsible section (`LocalFilterSidebar`).
 */
export type LocalFilterGroupsLayout = "drawer" | "stacked" | "sidebar";

/**
 * "Who runs it" through "Access needs", one band of the drawer. Once the
 * drawer is wide enough they pair up two to a row (`.factGrid`), so a wide
 * screen is not left with a tall single column of short chip rows. The
 * mobile sheet keeps them as a plain stack.
 */
function FactBands({
  isStacked,
  children,
}: {
  isStacked: boolean;
  children: ReactNode;
}) {
  if (isStacked) return <>{children}</>;
  return (
    <div className={s.factBands}>
      <div className={s.factGrid}>{children}</div>
    </div>
  );
}

/**
 * The groups as bands, for the drawer and the mobile sheet: place type (what
 * they sell, on the Online tab), the sort beside the one-tap narrowings (open
 * now, verified safe spaces, out and about and, on the Online tab for a
 * signed-in member, Show 18+ shops), "who runs it", how to get in, ways to
 * pay, languages, inclusion practices, access needs, and more filters. Each
 * one is a band with the same uppercase label, so both surfaces read as a
 * stack of named sections.
 */
function LocalFilterBands({
  layout,
  categories,
  onToggleCategory,
  onClearCategories,
  categoryCounts,
  chipCounts,
  listingFacts,
  onToggleListingFact,
  safeOnly,
  onToggleSafeOnly,
  openNow,
  onToggleOpenNow,
  isOutAndAbout,
  onToggleOutAndAbout,
  access,
  onToggleAccess,
  owned,
  onToggleOwned,
  sort,
  onSortChange,
  isLocationOn,
  isOnlineScope = false,
  isAdultShown,
  canShowAdult,
  onToggleAdult,
}: LocalFilterFieldsProps & { layout: "drawer" | "stacked" }) {
  return (
    <>
      <LocalCategoryFilter
        categories={categories}
        onToggleCategory={onToggleCategory}
        onClearCategories={onClearCategories}
        categoryCounts={categoryCounts}
        categoryIds={localCategoryChipIds(isOnlineScope, isAdultShown)}
        labelKey={
          isOnlineScope
            ? "marketing:local.filter.categoryLabelOnline"
            : undefined
        }
        hasSwatches={!isOnlineScope}
      />
      {/* Ordering and the one-tap narrowings share a band: all short
          controls, side by side they fill a line the place-type chips have
          already made wide. */}
      <RefineSplit>
        <LocalSortFilter
          sort={sort}
          onSortChange={onSortChange}
          isLocationOn={isLocationOn}
        />
        <LocalQuickFilters
          showOpenNow={!isOnlineScope}
          openNow={openNow}
          onToggleOpenNow={onToggleOpenNow}
          showOutAndAbout={!isOnlineScope && onToggleOutAndAbout !== undefined}
          isOutAndAbout={isOutAndAbout === true}
          onToggleOutAndAbout={onToggleOutAndAbout}
          safeOnly={safeOnly}
          onToggleSafeOnly={onToggleSafeOnly}
          chipCounts={chipCounts}
          showAdult={isOnlineScope && canShowAdult === true}
          isAdultShown={isAdultShown}
          onToggleAdult={onToggleAdult}
        />
      </RefineSplit>
      <FactBands isStacked={layout === "stacked"}>
        <LocalOwnedByFilter
          owned={owned}
          onToggleOwned={onToggleOwned}
          ownedCounts={chipCounts.owned}
        />
        <LocalListingFactFilters
          listingFacts={listingFacts}
          onToggleListingFact={onToggleListingFact}
          counts={chipCounts.listingFacts}
          isOnlineScope={isOnlineScope}
        />
        {!isOnlineScope && (
          <LocalAccessFilter
            access={access}
            onToggleAccess={onToggleAccess}
            accessCounts={chipCounts.access}
          />
        )}
      </FactBands>
      <LocalMoreFilters
        listingFacts={listingFacts}
        onToggleListingFact={onToggleListingFact}
        counts={chipCounts.listingFacts}
        isOnlineScope={isOnlineScope}
        categories={categories}
      />
    </>
  );
}

/**
 * The filter groups, in one place for every surface that shows them: bands
 * in the full screen map's drawer and the mobile sheet, collapsible sections
 * in the desktop sidebar.
 */
export function LocalFilterGroups({
  layout,
  ...fields
}: LocalFilterFieldsProps & { layout: LocalFilterGroupsLayout }) {
  if (layout === "sidebar") return <LocalFilterSidebar {...fields} />;
  return <LocalFilterBands {...fields} layout={layout} />;
}
