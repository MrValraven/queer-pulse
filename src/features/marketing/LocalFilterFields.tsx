import type { ReactNode } from "react";
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
import { LocalQuickFilters } from "./LocalQuickFilters";
import { LocalSortFilter } from "./LocalSortFilter";
import { LocalVibeFilter } from "./LocalVibeFilter";
import type { LocalSort } from "./localPlaces";
import type { AccessibilitySlug } from "./listBusiness/listingAccessibility.data";
import s from "./LocalFilterBar.module.css";

export interface LocalFilterFieldsProps {
  category: string;
  onCategoryChange: (value: string) => void;
  /** Live count per category id (+ "all"), reflecting the other active filters. */
  categoryCounts: Record<string, number>;
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
  /** Accessibility needs currently filtered on (`?access=`), all of which a
   *  place must meet to appear. */
  access: AccessibilitySlug[];
  onToggleAccess: (slug: AccessibilitySlug) => void;
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
   *  where the other two live. Rendered by the `"bar"` variant only: the mobile
   *  sheet is itself behind a tap, and distance is too central to bury there,
   *  so on phones the Local page keeps it in the results header instead. */
  nearMeSlot?: ReactNode;
  /** The List/Map switcher, which rides the far end of the search row so every
   *  control that shapes the results sits on one line. Rendered by the `"bar"`
   *  variant only: on phones the switcher lives in the sticky toolbar, where it
   *  stays reachable while scrolled deep into the list. */
  viewSlot?: ReactNode;
}

interface LocalFilterFieldsVariantProps extends LocalFilterFieldsProps {
  /**
   * Where this set is rendered. `"bar"` (default) is the desktop sticky bar,
   * where every filter collapses behind the "Refine" toggle so the bar stays
   * one row tall. `"sheet"` is the mobile Filters sheet, which is itself
   * already a collapsed surface — nesting a second drawer inside it would put
   * the place types two taps deep, so there the groups render flat.
   */
  variant?: "bar" | "sheet";
}

/**
 * The filter set itself: search, then the groups. Place type, the two one-tap
 * narrowings (open now, verified safe spaces), access needs, and (demo-only)
 * vibe. Rendered inline in the desktop bar behind the "Refine" toggle, or flat
 * inside the mobile "Filters" sheet; one markup source so the two layouts never
 * diverge in behaviour.
 */
export function LocalFilterFields({
  category,
  onCategoryChange,
  categoryCounts,
  query,
  onQueryChange,
  vibes,
  onToggleVibe,
  safeOnly,
  onToggleSafeOnly,
  openNow,
  onToggleOpenNow,
  access,
  onToggleAccess,
  sort,
  onSortChange,
  isLocationOn,
  nearMeSlot,
  viewSlot,
  variant = "bar",
}: LocalFilterFieldsVariantProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Every filter collapses behind one toggle so the bar stays a single row;
  // the visitor's open/closed choice sticks per device.
  const refine = useRefineDrawer("qp.local.refineOpen");
  // Vibe (Cozy/Loud/Chill) only ever has data on demo-only venues (`map.data`'s
  // `VENUES.vibe`) — a real business has no vibe-tag field at all (its
  // `photos.vibe` is an unrelated photo-caption slot, not a mood tag), so the
  // chips would silently do nothing to a real listing. Gated to demo mode only
  // (gap-audit HSG-8), matching this folder's existing `useDemoMode` gates
  // (`DirectoryAsideExtras`, `DirectoryAsideOwner`) until/unless a real
  // vibe-tag field exists on live businesses.
  const showVibeFilter = demoMode;
  // Surfaced on the collapsed toggle so hidden-but-active filters still read.
  // The place type counts too now that it lives inside the drawer.
  const activeRefineCount =
    vibes.length +
    access.length +
    (safeOnly ? 1 : 0) +
    (openNow ? 1 : 0) +
    (category !== "all" ? 1 : 0);

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
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
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
        category={category}
        onCategoryChange={onCategoryChange}
        categoryCounts={categoryCounts}
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
          openNow={openNow}
          onToggleOpenNow={onToggleOpenNow}
          safeOnly={safeOnly}
          onToggleSafeOnly={onToggleSafeOnly}
        />
      </RefineSplit>
      <LocalAccessFilter access={access} onToggleAccess={onToggleAccess} />
      {showVibeFilter && (
        <LocalVibeFilter vibes={vibes} onToggleVibe={onToggleVibe} />
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
      <div className={s.barRow}>
        {search}
        {nearMeSlot}
        <RefineToggle {...refine.toggleProps} activeCount={activeRefineCount} />
        {viewSlot && <div className={s.viewSlot}>{viewSlot}</div>}
      </div>
      <RefinePanel {...refine.panelProps}>{groups}</RefinePanel>
    </>
  );
}
