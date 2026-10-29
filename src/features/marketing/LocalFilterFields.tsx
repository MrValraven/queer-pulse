import { useState, type CSSProperties, type ReactNode } from "react";
import {
  RefinePanel,
  RefineSplit,
  RefineToggle,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalAccessFilter } from "./LocalAccessFilter";
import { LocalCategoryFilter } from "./LocalCategoryFilter";
import { LocalListingFactFilters } from "./LocalListingFactFilters";
import { LocalMoreFilters } from "./LocalMoreFilters";
import { LocalOwnedByFilter } from "./LocalOwnedByFilter";
import { LocalQuickFilters } from "./LocalQuickFilters";
import { LocalSortFilter } from "./LocalSortFilter";
import type { LocalSort } from "./localPlaces";
import {
  countListingFactFilters,
  type DirectoryListingFactFilters,
  type ListingFactFilterChange,
} from "./directoryListingFactFilters";
import {
  ADULT_LISTING_CATEGORY_SLUG,
  LOCAL_CATEGORIES,
  ONLINE_LISTING_CATEGORY_SLUGS,
} from "./localCategories";
import type { LocalChipCounts } from "./useDirectoryFilters";
import type { AccessibilitySlug } from "./listBusiness/listingAccessibility.data";
import type { ListingOwnedBy } from "./listBusiness/listingOwnedBy.data";
import s from "./LocalFilterBar.module.css";

export interface LocalFilterFieldsProps {
  /** The chosen place types (`?cat=`), in chip order. Empty means every type. */
  categories: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
  /** Live count per category id (+ "all"), reflecting the other active filters. */
  categoryCounts: Record<string, number>;
  /** How many loaded places each one-tap chip (open now, verified, each access
   *  need, each fact chip) would leave if turned on, with the other filters
   *  kept. */
  chipCounts: LocalChipCounts;
  /** True once every page of places has loaded without error, which is when a
   *  zero count is final and its chip can go unpickable. Until then a zero may
   *  only mean the matching place sits on a page still to come. */
  isLoadedSetComplete: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  /** The attribute and fact filters (`?attr=`, `?entry=`, `?pay=`,
   *  `?lang=`, `?practice=`). */
  listingFacts: DirectoryListingFactFilters;
  onToggleListingFact: (change: ListingFactFilterChange) => void;
  /** Whether the "Verified safe spaces" filter (`?safe=verified`) is active. */
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
  /** Whether the "Open now" filter (`?open=now`) is active. */
  openNow: boolean;
  onToggleOpenNow: () => void;
  /** Whether "Out and about" (`?mobile=1`) is on. Offered on the List and
   *  Map tabs, where a business with no premises sits beside the rest. */
  isOutAndAbout?: boolean;
  onToggleOutAndAbout?: () => void;
  /** Accessibility needs currently filtered on (`?access=`), all of which a
   *  place must meet to appear. */
  access: AccessibilitySlug[];
  onToggleAccess: (slug: AccessibilitySlug) => void;
  /** Ownership tags currently filtered on (`?owned=`), any of which a place
   *  must carry. */
  owned: ListingOwnedBy[];
  onToggleOwned: (value: ListingOwnedBy) => void;
  /** How the results are ordered. Sorting is a refinement, so the control lives
   *  inside the drawer with the filters, which leaves the results header to
   *  say what it found. */
  sort: LocalSort;
  onSortChange: (next: string) => void;
  /** True while "use my location" is on. The sort control needs it because a
   *  known position changes what some sorts mean (see `LocalSortFilter`), and
   *  never because it overrides them. */
  isLocationOn: boolean;
  /** The "use my location" control, which rides the search row between the
   *  field and "Refine": ordering the results is a refinement, and that row is
   *  where the other two live. Rendered by the `"bar"` and `"overlay"`
   *  variants: the mobile sheet is itself behind a tap, and distance is too
   *  central to bury there, so on phones the Local page keeps it in the
   *  results header. */
  nearMeSlot?: ReactNode;
  /** The List/Map switcher, which rides the far end of the search row so every
   *  control that shapes the results sits on one line. Rendered by the `"bar"`
   *  variant only: on phones the switcher lives in the sticky toolbar, where it
   *  stays reachable while scrolled deep into the list. */
  viewSlot?: ReactNode;
  /** The "showing X of Y places" count, which sits on the search row after
   *  "Refine" and before the List/Map switcher, so the row that shapes the
   *  results also says what they found and the page spends no extra line on
   *  it. Rendered by the `"bar"` variant only: on phones the count opens the
   *  results header, beside the near-me control. */
  countSlot?: ReactNode;
  /** True on the Online tab, which lists every business that sells online.
   *  Its category chips are what they sell; the questions about a visit (is
   *  it open right now, is the entrance step-free, how to get in, ways to
   *  pay) are left out,
   *  since they say nothing about buying online. */
  isOnlineScope?: boolean;
  /** Whether "Show 18+ shops" (`?adult=1`) is on and read. Show 18+ shops is
   *  offered on the Online tab to a signed-in member only. */
  isAdultShown?: boolean;
  /** True when "Show 18+ shops" may be offered: the Online tab, for a
   *  signed-in member only. */
  canShowAdult?: boolean;
  /** Turns "Show 18+ shops" on or off. */
  onToggleAdult?: () => void;
}

interface LocalFilterFieldsVariantProps extends LocalFilterFieldsProps {
  /**
   * Where this set is rendered. `"bar"` (default) is the desktop sticky bar,
   * where every filter collapses behind the "Refine" toggle so the bar stays
   * one row tall. `"sheet"` is the mobile Filters sheet, which is itself
   * already a collapsed surface. Nesting a second drawer inside it would put
   * the place types two taps deep, so there the groups render flat.
   * `"overlay"` is the floating card inside the desktop full screen map: the
   * bar's row minus the List/Map switcher, with a drawer state of its own.
   */
  variant?: "bar" | "sheet" | "overlay";
  /** The active-filter chips and "Clear filters", placed straight under the
   *  search row and above the drawer, so they stay in view while the drawer is
   *  open. The full screen map card passes them; the page bar renders its own
   *  chips after the whole set. */
  activeFiltersSlot?: ReactNode;
}

/**
 * "Who runs it" through "Access needs", one band of the drawer. Once the
 * drawer is wide enough they pair up two to a row (`.factGrid`), so a wide
 * screen is not left with a tall single column of short chip rows. The
 * mobile sheet keeps them as its plain stack.
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

/** The search field on the filter row. The text it shows is held by
 *  `LocalFilterFields`, which keeps it in step with the URL's `query`. */
function LocalSearchField({
  searchText,
  onSearchTextChange,
}: {
  searchText: string;
  onSearchTextChange: (next: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.search}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx={11} cy={11} r={7} />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        aria-label={t("marketing:local.filter.searchPlaceholder")}
        placeholder={t("marketing:local.filter.searchPlaceholder")}
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        // Escape empties a filled field first. Claiming the key keeps the full
        // screen map open (useMapFullscreen leaves on any Escape left
        // unclaimed), so only an Escape in an empty field closes it.
        onKeyDown={(event) => {
          if (event.key !== "Escape" || searchText === "") return;
          event.preventDefault();
          onSearchTextChange("");
        }}
      />
    </div>
  );
}

/**
 * The filter set itself: search, then the groups. Place type (what they
 * sell, on the Online tab), the one-tap narrowings (open now, verified safe
 * spaces, out and about and, on the Online tab for a signed-in member, Show
 * 18+ shops), "who runs it", how to get in, ways to pay, languages,
 * inclusion practices, access needs, and more filters. Rendered inline in the
 * desktop bar behind the "Refine" toggle, or flat inside the mobile "Filters"
 * sheet; one markup source so the two layouts never diverge in behaviour.
 */
export function LocalFilterFields({
  categories,
  onToggleCategory,
  onClearCategories,
  categoryCounts,
  chipCounts,
  isLoadedSetComplete,
  query,
  onQueryChange,
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
  nearMeSlot,
  viewSlot,
  countSlot,
  isOnlineScope = false,
  isAdultShown,
  canShowAdult,
  onToggleAdult,
  variant = "bar",
  activeFiltersSlot,
}: LocalFilterFieldsVariantProps) {
  // Every filter collapses behind one toggle so the bar stays a single row;
  // the visitor's open/closed choice sticks per device. The map card keeps its
  // own key, so entering full screen opens on a shut drawer and the map stays
  // in view whatever the page's drawer was left at.
  const isOverlay = variant === "overlay";
  const refine = useRefineDrawer(
    isOverlay ? "qp.local.mapRefineOpen" : "qp.local.refineOpen",
  );
  // Surfaced on the collapsed toggle so hidden-but-active filters still read.
  // Every chosen place type counts as one filter, the same way each fact chip
  // and each access need does, so the badge matches the chips applied.
  const activeRefineCount =
    countListingFactFilters(listingFacts) +
    access.length +
    categories.length +
    (safeOnly ? 1 : 0) +
    owned.length +
    (openNow ? 1 : 0) +
    (!isOnlineScope && isOutAndAbout ? 1 : 0) +
    (isOnlineScope && isAdultShown ? 1 : 0);
  // The field holds its own text. `query` lives in the URL, and the router
  // commits a URL change inside a transition, so a field bound straight to it
  // was reset to a stale value between fast keystrokes and dropped letters.
  // A change made elsewhere ("Clear filters", a removed chip) still reaches
  // the field: it is adopted during render, React's pattern for state that
  // follows a prop (see `AdminCommunityDetail`).
  const [searchText, setSearchText] = useState(query);
  const [previousQuery, setPreviousQuery] = useState(query);
  if (query !== previousQuery) {
    setPreviousQuery(query);
    setSearchText(query);
  }
  const changeSearchText = (next: string) => {
    setSearchText(next);
    onQueryChange(next);
  };

  const search = (
    <LocalSearchField
      searchText={searchText}
      onSearchTextChange={changeSearchText}
    />
  );

  // The groups, in one place: the bar renders them inside the refine drawer,
  // the sheet renders them straight into its body. Each one is a band with the
  // same uppercase label, so the drawer reads as a stack of named sections.
  const groups = (
    <>
      <LocalCategoryFilter
        categories={categories}
        onToggleCategory={onToggleCategory}
        onClearCategories={onClearCategories}
        categoryCounts={categoryCounts}
        isLoadedSetComplete={isLoadedSetComplete}
        categoryIds={
          isOnlineScope
            ? ONLINE_LISTING_CATEGORY_SLUGS.filter(
                (slug) => slug !== ADULT_LISTING_CATEGORY_SLUG || isAdultShown,
              )
            : LOCAL_CATEGORIES
        }
        labelKey={
          isOnlineScope
            ? "marketing:local.filter.categoryLabelOnline"
            : undefined
        }
        hasSwatches={!isOnlineScope}
      />
      {/* Ordering and the two one-tap narrowings share a band: all three are
          short controls, and side by side they fill a line the place-type chips
          have already made wide. */}
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
          isLoadedSetComplete={isLoadedSetComplete}
          showAdult={isOnlineScope && canShowAdult === true}
          isAdultShown={isAdultShown}
          onToggleAdult={onToggleAdult}
        />
      </RefineSplit>
      <FactBands isStacked={variant === "sheet"}>
        <LocalOwnedByFilter owned={owned} onToggleOwned={onToggleOwned} />
        <LocalListingFactFilters
          listingFacts={listingFacts}
          onToggleListingFact={onToggleListingFact}
          counts={chipCounts.listingFacts}
          isLoadedSetComplete={isLoadedSetComplete}
          isOnlineScope={isOnlineScope}
        />
        {!isOnlineScope && (
          <LocalAccessFilter
            access={access}
            onToggleAccess={onToggleAccess}
            accessCounts={chipCounts.access}
            isLoadedSetComplete={isLoadedSetComplete}
          />
        )}
      </FactBands>
      <LocalMoreFilters
        listingFacts={listingFacts}
        onToggleListingFact={onToggleListingFact}
        counts={chipCounts.listingFacts}
        isLoadedSetComplete={isLoadedSetComplete}
        isOnlineScope={isOnlineScope}
        categories={categories}
      />
    </>
  );

  if (variant === "sheet") {
    return (
      <>
        {search}
        {groups}
      </>
    );
  }

  // The row's grid gives the search field the flexible column and each control
  // after it a column of its own, so the template follows how many controls
  // this row carries: near-me is missing on the Online tab, and the map's card
  // drops the count and the switcher. The count keeps a separate class because
  // a narrow desktop moves it under the search field, out of the row's line.
  const isCountShown = Boolean(countSlot) && !isOverlay;
  const isViewShown = Boolean(viewSlot) && !isOverlay;
  const controlColumnCount = (nearMeSlot ? 1 : 0) + 1 + (isViewShown ? 1 : 0);

  return (
    <>
      <div
        className={isCountShown ? `${s.barRow} ${s.barRowWithCount}` : s.barRow}
        style={{ "--bar-controls": controlColumnCount } as CSSProperties}
      >
        {search}
        {nearMeSlot}
        <RefineToggle {...refine.toggleProps} activeCount={activeRefineCount} />
        {isCountShown && <div className={s.countSlot}>{countSlot}</div>}
        {isViewShown && <div className={s.viewSlot}>{viewSlot}</div>}
      </div>
      {activeFiltersSlot}
      {/* Inside the map's card the drawer sheds its own card, which would
          double the border and narrow the bands. */}
      <RefinePanel {...refine.panelProps} isFlat={isOverlay}>
        {groups}
      </RefinePanel>
    </>
  );
}
