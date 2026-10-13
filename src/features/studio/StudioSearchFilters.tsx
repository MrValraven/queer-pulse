import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchType } from "./api/studio.types";
import { STUDIO_SEARCH_FILTERS } from "./studioSearch.data";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./studioPages.module.css";

export function StudioSearchFilters({
  type,
  onChange,
}: {
  type: StudioSearchType;
  onChange: (type: StudioSearchType) => void;
}) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  return (
    <div
      className={s.chips}
      role="group"
      aria-label={t("studio:searchPage.filtersLabel")}
    >
      {STUDIO_SEARCH_FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={`${s.chip} ${type === filter.id ? s.chipOn : ""}`}
          aria-pressed={type === filter.id}
          onClick={() => onChange(filter.id)}
        >
          {t(filter.labelKey)}
        </button>
      ))}
      {isShowcase && (
        <Link to={routes.studioSheetStore} className={s.chip}>
          {t("studio:search.filter.sheetMusic")}
        </Link>
      )}
    </div>
  );
}
