import { useId } from "react";
import { FiChevronDown, FiClock, FiShield, FiSliders } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useLocalStorage } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalAccessFilter } from "./LocalAccessFilter";
import { LocalCategoryFilter } from "./LocalCategoryFilter";
import { LocalVibeFilter } from "./LocalVibeFilter";
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
  variant = "bar",
}: LocalFilterFieldsVariantProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const refineBodyId = useId();
  // Every filter collapses behind one toggle so the sticky bar stays a single
  // row; the visitor's open/closed choice sticks per device.
  const [refineOpen, setRefineOpen] = useLocalStorage(
    "qp.local.refineOpen",
    false,
  );
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
  // the sheet renders them straight into its body.
  const groups = (
    <>
      <LocalCategoryFilter
        category={category}
        onCategoryChange={onCategoryChange}
        categoryCounts={categoryCounts}
      />
      {/* The two one-tap narrowings, side by side: is it open right now, and
          has it been verified as a safe space. Each chip names itself, so the
          group only needs a name for the set as a whole. */}
      <div
        className={s.safeRow}
        role="group"
        aria-label={t("marketing:local.filter.quickFiltersLabel")}
      >
        <button
          type="button"
          aria-pressed={openNow}
          className={[s.chip, openNow && s.chipOn].filter(Boolean).join(" ")}
          onClick={onToggleOpenNow}
        >
          <FiClock aria-hidden />
          {t("marketing:local.filter.openNow")}
        </button>
        <button
          type="button"
          aria-pressed={safeOnly}
          className={[s.chip, safeOnly && s.chipOn].filter(Boolean).join(" ")}
          onClick={onToggleSafeOnly}
        >
          <FiShield aria-hidden />
          {t("marketing:local.filter.verifiedSafeSpaces")}
        </button>
      </div>
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
        <button
          type="button"
          className={s.refineToggle}
          aria-expanded={refineOpen}
          aria-controls={refineBodyId}
          onClick={() => setRefineOpen((open) => !open)}
        >
          <FiSliders aria-hidden />
          {t("marketing:local.filter.refine")}
          {activeRefineCount > 0 && (
            <span className={s.refineCount} aria-hidden>
              {activeRefineCount}
            </span>
          )}
          <span
            className={[s.refineChevron, refineOpen && s.refineChevronOpen]
              .filter(Boolean)
              .join(" ")}
            aria-hidden
          >
            <FiChevronDown />
          </span>
        </button>
      </div>
      {/* Body stays mounted so it can animate open AND closed. The grid-rows
          0fr↔1fr trick collapses it without measuring; `inert` keeps the
          hidden refinements out of tab order and off screen readers. */}
      <div
        className={[s.refineWrap, refineOpen && s.refineWrapOpen]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          id={refineBodyId}
          className={s.refineBody}
          inert={!refineOpen || undefined}
        >
          {groups}
        </div>
      </div>
    </>
  );
}
