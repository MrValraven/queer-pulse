import { useState, type ReactNode } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  RefinePanel,
  RefineSplit,
  RefineToggle,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalAccessFilter } from "./LocalAccessFilter";
import { LocalCategoryFilter } from "./LocalCategoryFilter";
import { LocalOwnedByFilter } from "./LocalOwnedByFilter";
import { LocalQuickFilters } from "./LocalQuickFilters";
import { LocalSortFilter } from "./LocalSortFilter";
import { LocalVibeFilter } from "./LocalVibeFilter";
import type { LocalSort } from "./localPlaces";
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
   *  need, each vibe) would leave if turned on, with the other filters kept. */
  chipCounts: LocalChipCounts;
  /** True once every page of places has loaded without error, which is when a
   *  zero count is final and its chip can go unpickable. Until then a zero may
   *  only mean the matching place sits on a page still to come. */
  isLoadedSetComplete: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  vibes: string[];
  onToggleVibe: (vibe: string) => void;
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
   *  inside the drawer with the filters rather than out on the results header,
   *  which leaves that header to say what it found. */
  sort: LocalSort;
  onSortChange: (next: string) => void;
  /** True while "use my location" is on. The sort control needs it because a
   *  known position changes what some sorts mean (see `LocalSortFilter`), and
   *  never because it overrides them. */
  isLocationOn: boolean;
  /** The "use my location" control, which rides the search row between the
   *  field and "Refine" — ordering the results is a refinement, and that row is
   *  where the other two live. Rendered by the `"bar"` and `"overlay"`
   *  variants: the mobile sheet is itself behind a tap, and distance is too
   *  central to bury there, so on phones the Local page keeps it in the
   *  results header instead. */
  nearMeSlot?: ReactNode;
  /** The List/Map switcher, which rides the far end of the search row so every
   *  control that shapes the results sits on one line. Rendered by the `"bar"`
   *  variant only: on phones the switcher lives in the sticky toolbar, where it
   *  stays reachable while scrolled deep into the list. */
  viewSlot?: ReactNode;
  /** True on the Online tab, which lists every business that sells online.
   *  Its category chips are what they sell; the questions about a visit (is
   *  it open right now, is the entrance step-free, the vibe) are left out,
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
   * already a collapsed surface — nesting a second drawer inside it would put
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
 * The filter set itself: search, then the groups. Place type (what they
 * sell, on the Online tab), the one-tap narrowings (open now, verified safe
 * spaces, out and about and, on the Online tab for a signed-in member, Show
 * 18+ shops), "who
 * runs it", access needs, and (demo-only) vibe. Rendered inline in the
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
  vibes,
  onToggleVibe,
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
  isOnlineScope = false,
  isAdultShown,
  canShowAdult,
  onToggleAdult,
  variant = "bar",
  activeFiltersSlot,
}: LocalFilterFieldsVariantProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Every filter collapses behind one toggle so the bar stays a single row;
  // the visitor's open/closed choice sticks per device. The map card keeps its
  // own key, so entering full screen opens on a shut drawer and the map stays
  // in view whatever the page's drawer was left at.
  const isOverlay = variant === "overlay";
  const refine = useRefineDrawer(
    isOverlay ? "qp.local.mapRefineOpen" : "qp.local.refineOpen",
  );
  // Vibe (Cozy/Loud/Chill) only ever has data on demo-only venues (`map.data`'s
  // `VENUES.vibe`) — a real business has no vibe-tag field at all (its
  // `photos.vibe` is an unrelated photo-caption slot, not a mood tag), so the
  // chips would silently do nothing to a real listing. Gated to demo mode only
  // (gap-audit HSG-8), matching this folder's existing `useDemoMode` gates
  // (`DirectoryAsideExtras`, `DirectoryAsideFooter`) until/unless a real
  // vibe-tag field exists on live businesses.
  const showVibeFilter = demoMode && !isOnlineScope;
  // Surfaced on the collapsed toggle so hidden-but-active filters still read.
  // Every chosen place type counts as one filter, the same way each vibe and
  // each access need does, so the badge matches the chips applied.
  const activeRefineCount =
    vibes.length +
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
        onChange={(event) => changeSearchText(event.target.value)}
        // Escape empties a filled field first. Claiming the key keeps the full
        // screen map open (useMapFullscreen leaves on any Escape left
        // unclaimed), so only an Escape in an empty field closes it.
        onKeyDown={(event) => {
          if (event.key !== "Escape" || searchText === "") return;
          event.preventDefault();
          changeSearchText("");
        }}
      />
    </div>
  );

  // The groups, in one place: the bar renders them inside the refine drawer,
  // the sheet renders them straight into its body. Each one is a band with the
  // same uppercase label, so the drawer reads as a stack of named sections
  // instead of loose chips.
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
      <LocalOwnedByFilter owned={owned} onToggleOwned={onToggleOwned} />
      {!isOnlineScope && (
        <LocalAccessFilter
          access={access}
          onToggleAccess={onToggleAccess}
          accessCounts={chipCounts.access}
          isLoadedSetComplete={isLoadedSetComplete}
        />
      )}
      {showVibeFilter && (
        <LocalVibeFilter
          vibes={vibes}
          onToggleVibe={onToggleVibe}
          vibeCounts={chipCounts.vibes}
          isLoadedSetComplete={isLoadedSetComplete}
        />
      )}
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

  return (
    <>
      <div className={isOverlay ? `${s.barRow} ${s.barRowOverlay}` : s.barRow}>
        {search}
        {nearMeSlot}
        <RefineToggle {...refine.toggleProps} activeCount={activeRefineCount} />
        {viewSlot && !isOverlay && <div className={s.viewSlot}>{viewSlot}</div>}
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
