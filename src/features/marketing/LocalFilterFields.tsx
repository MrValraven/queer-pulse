import type { CSSProperties, ReactNode } from "react";
import {
  RefineGlideContext,
  RefinePanel,
  RefineToggle,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import type { LocalSort } from "./localPlaces";
import type {
  DirectoryListingFactFilters,
  ListingFactFilterChange,
} from "./directoryListingFactFilters";
import { countActiveLocalFilters } from "./localActiveFilterCount";
import { LocalFilterGroups } from "./LocalFilterGroups";
import { LocalSearch } from "./LocalSearchField";
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
  /** How the results are ordered. On desktop the control sits on the row
   *  above the results, beside the Filters toggle; the mobile sheet and the
   *  full screen map's drawer carry it with the filters. */
  sort: LocalSort;
  onSortChange: (next: string) => void;
  /** True while "use my location" is on. The sort control needs it because a
   *  known position changes what some sorts mean (see `LocalSortFilter`), and
   *  never because it overrides them. */
  isLocationOn: boolean;
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
   * Where this set is rendered. `"sheet"` is the mobile Filters sheet, which
   * is itself already a collapsed surface. Nesting a second drawer inside it
   * would put the place types two taps deep, so there the groups render flat
   * under the search field. `"sidebar"` is the desktop filter sidebar beside
   * the results: the groups alone, flat and stacked, since the search field
   * and the sort sit above the results there. `"overlay"` is the floating card
   * inside the desktop full screen map: the search row with "use my location"
   * and a "Refine" toggle, whose drawer keeps a state of its own.
   */
  variant: "sheet" | "sidebar" | "overlay";
  /** The "use my location" control, which rides the overlay's search row
   *  between the field and "Refine". */
  nearMeSlot?: ReactNode;
  /** The active-filter chips and "Clear filters", placed straight under the
   *  overlay's search row and above its drawer, so they stay in view while the
   *  drawer is open. */
  activeFiltersSlot?: ReactNode;
}

/**
 * The full screen map's card: the search row, then the groups behind its
 * own "Refine" drawer. The card keeps its own storage key, so entering full
 * screen opens on a shut drawer and the map stays in view.
 */
function LocalFilterOverlay({
  nearMeSlot,
  activeFiltersSlot,
  ...fields
}: LocalFilterFieldsProps & {
  nearMeSlot?: ReactNode;
  activeFiltersSlot?: ReactNode;
}) {
  const refine = useRefineDrawer("qp.local.mapRefineOpen");
  // The row's grid gives the search field the flexible column and each control
  // after it a column of its own: near-me (missing on the Online tab) and
  // "Refine".
  const controlColumnCount = (nearMeSlot ? 1 : 0) + 1;

  return (
    <>
      <div
        className={s.barRow}
        style={{ "--bar-controls": controlColumnCount } as CSSProperties}
      >
        <LocalSearch
          query={fields.query}
          onQueryChange={fields.onQueryChange}
        />
        {nearMeSlot}
        <RefineToggle
          {...refine.toggleProps}
          activeCount={countActiveLocalFilters(fields)}
        />
      </div>
      {activeFiltersSlot}
      {/* Inside the map's card the drawer sheds its own card, which would
          double the border and narrow the bands. */}
      <RefinePanel {...refine.panelProps} isFlat>
        <LocalFilterGroups {...fields} layout="drawer" />
      </RefinePanel>
    </>
  );
}

/**
 * The filter set itself, in one markup source for every surface so they never
 * diverge in behaviour: flat inside the mobile "Filters" sheet, stacked in the
 * desktop sidebar beside the results, and behind a "Refine" drawer on the
 * full screen map's card.
 */
export function LocalFilterFields({
  variant,
  nearMeSlot,
  activeFiltersSlot,
  ...fields
}: LocalFilterFieldsVariantProps) {
  if (variant === "overlay") {
    return (
      <LocalFilterOverlay
        {...fields}
        nearMeSlot={nearMeSlot}
        activeFiltersSlot={activeFiltersSlot}
      />
    );
  }

  if (variant === "sidebar") {
    // The sidebar replaces the desktop drawer, so its chip rows keep the
    // drawer's glide when a chip changes width.
    return (
      <RefineGlideContext.Provider value={true}>
        <LocalFilterGroups {...fields} layout="sidebar" />
      </RefineGlideContext.Provider>
    );
  }

  return (
    <>
      <LocalSearch query={fields.query} onQueryChange={fields.onQueryChange} />
      <LocalFilterGroups {...fields} layout="stacked" />
    </>
  );
}
