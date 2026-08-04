import { useId } from "react";
import { FiShield, FiSliders } from "react-icons/fi";
import { FilterChips } from "../../shared/components/ui";
import { useLocalStorage } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOCAL_CATEGORIES, LOCAL_CATEGORY_LABEL_KEYS } from "./localPlaces";
import { CATEGORY_ICON, VIBES, VIBE_LABEL_KEYS } from "./map.data";
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
}

/**
 * The filter set itself — search + unified category chips + a collapsible drawer
 * of secondary refinements (verified-safe-spaces + vibe chips). Rendered inline
 * in the desktop bar, or inside the mobile "Filters" sheet; one markup source so
 * the two layouts never diverge in behaviour.
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
}: LocalFilterFieldsProps) {
  const { t } = useTranslation();
  const vibeLabelId = useId();
  const refineBodyId = useId();
  // The secondary refinements (safe-spaces + vibe) collapse behind one toggle so
  // the bar stays uncluttered; the visitor's open/closed choice sticks per device.
  const [refineOpen, setRefineOpen] = useLocalStorage(
    "qp.local.refineOpen",
    false,
  );
  // Surfaced on the collapsed toggle so hidden-but-active filters still read.
  const activeRefineCount = vibes.length + (safeOnly ? 1 : 0);
  const count = (value: string) => (
    <span className={s.count} aria-hidden>
      {categoryCounts[value] ?? 0}
    </span>
  );
  // Each category chip leads with a colour swatch that mirrors its map pin
  // (category fill + white icon), so the filter bar doubles as a live legend.
  const categoryChip = (categoryId: string, label: string) => {
    const Icon = CATEGORY_ICON[categoryId];
    return {
      value: categoryId,
      label: (
        <>
          {Icon && (
            <span className={s.catSwatch} data-category={categoryId} aria-hidden>
              <Icon />
            </span>
          )}
          {label}
          {count(categoryId)}
        </>
      ),
    };
  };
  const categoryOptions = [
    {
      value: "all",
      label: (
        <>
          {t("marketing:directory.cat.all")}
          {count("all")}
        </>
      ),
    },
    ...LOCAL_CATEGORIES.map((categoryId) =>
      categoryChip(categoryId, t(LOCAL_CATEGORY_LABEL_KEYS[categoryId]!)),
    ),
  ];

  return (
    <>
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
      <FilterChips
        label={t("marketing:local.filter.categoryAria")}
        options={categoryOptions}
        value={category}
        onChange={onCategoryChange}
      />
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
          ▾
        </span>
      </button>
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
          <div
            className={s.safeRow}
            role="group"
            aria-label={t("marketing:local.filter.verifiedSafeSpaces")}
          >
            <button
              type="button"
              aria-pressed={safeOnly}
              className={[s.chip, safeOnly && s.chipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={onToggleSafeOnly}
            >
              <FiShield aria-hidden />
              {t("marketing:local.filter.verifiedSafeSpaces")}
            </button>
          </div>
          <div className={s.vibeRow} role="group" aria-labelledby={vibeLabelId}>
            <span className={s.vibeLabel} id={vibeLabelId}>
              {t("marketing:local.filter.vibeLabel")}
            </span>
            {VIBES.map((vibe) => (
              <button
                type="button"
                key={vibe}
                aria-pressed={vibes.includes(vibe)}
                className={[s.chip, s.vibe, vibes.includes(vibe) && s.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggleVibe(vibe)}
              >
                {t(VIBE_LABEL_KEYS[vibe]!)}
              </button>
            ))}
            {vibes.length > 0 && (
              <span className={s.vibeNote}>
                {t("marketing:local.filter.vibeVenueNote")}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
