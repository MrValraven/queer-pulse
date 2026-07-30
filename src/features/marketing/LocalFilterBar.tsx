import { useId } from "react";
import { FilterChips } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOCAL_CATEGORIES, LOCAL_CATEGORY_LABEL_KEYS } from "./localPlaces";
import { VIBES, VIBE_LABEL_KEYS } from "./map.data";
import s from "./LocalFilterBar.module.css";

/** Shared filter bar for the Local page (both list + map views): search + unified category chips + secondary vibe chips. */
export function LocalFilterBar({
  category,
  onCategoryChange,
  categoryCounts,
  query,
  onQueryChange,
  vibes,
  onToggleVibe,
}: {
  category: string;
  onCategoryChange: (value: string) => void;
  /** Live count per category id (+ "all"), reflecting the other active filters. */
  categoryCounts: Record<string, number>;
  query: string;
  onQueryChange: (value: string) => void;
  vibes: string[];
  onToggleVibe: (vibe: string) => void;
}) {
  const { t } = useTranslation();
  const vibeLabelId = useId();
  const withCount = (value: string, label: string) => {
    const count = categoryCounts[value] ?? 0;
    return {
      value,
      label: (
        <>
          {label}
          <span className={s.count} aria-hidden>
            {count}
          </span>
        </>
      ),
    };
  };
  const categoryOptions = [
    withCount("all", t("marketing:directory.cat.all")),
    ...LOCAL_CATEGORIES.map((categoryId) =>
      withCount(categoryId, t(LOCAL_CATEGORY_LABEL_KEYS[categoryId]!)),
    ),
  ];
  return (
    <div className={s.bar}>
      <div className="wrap">
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
  );
}
