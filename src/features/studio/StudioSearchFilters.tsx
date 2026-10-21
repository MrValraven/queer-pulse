import { useId, useState } from "react";
import { FiSliders } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button, Collapse } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import type {
  StudioFormat,
  StudioGenre,
  StudioMood,
  StudioSearchType,
} from "./api/studio.types";
import { StudioChipRow } from "./StudioGenreChips";
import {
  StudioSearchFormatSelect,
  StudioSearchGenreSelect,
  StudioSearchMoodSelect,
} from "./StudioSearchGenreSelect";
import { STUDIO_SEARCH_FILTERS } from "./studioSearch.data";
import { useStudioShowcase } from "./useStudioShowcase";
import css from "./StudioSearch.module.css";

const PHONE_QUERY = mediaMax("sm");

/** The type tabs as links, like the browse chips (DES-38): each keeps the
 *  query and the facets, Back walks a change, and the current one carries
 *  `aria-current`. On a phone they sit on one line that scrolls sideways
 *  with snap. */
export function StudioSearchFilters({
  type,
  hrefFor,
}: {
  type: StudioSearchType;
  hrefFor: (type: StudioSearchType) => string;
}) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const chips = STUDIO_SEARCH_FILTERS.map((filter) => ({
    key: filter.id,
    label: t(filter.labelKey),
    href: hrefFor(filter.id),
    isCurrent: type === filter.id,
  }));
  const sheetMusicChip = {
    key: "sheet-music",
    label: t("studio:search.filter.sheetMusic"),
    href: routes.studioSheetStore,
    isCurrent: false,
  };
  return (
    <StudioChipRow
      label={t("studio:searchPage.filtersLabel")}
      chips={isShowcase ? [...chips, sheetMusicChip] : chips}
      className={css.typeChips}
    />
  );
}

/** The genre, mood and format selects under the type tabs, in one label
 *  column. Under Podcasts genre and mood fold away. On a phone they fold
 *  behind a Filters button that counts the filters in use. */
export function StudioSearchFacets({
  isPodcast,
  genre,
  mood,
  format,
  onGenreChange,
  onMoodChange,
  onFormatChange,
}: {
  isPodcast: boolean;
  genre: StudioGenre | null;
  mood: StudioMood | null;
  format: StudioFormat | null;
  onGenreChange: (genre: StudioGenre | null) => void;
  onMoodChange: (mood: StudioMood | null) => void;
  onFormatChange: (format: StudioFormat | null) => void;
}) {
  const { t } = useTranslation();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [isOpenOnPhone, setIsOpenOnPhone] = useState(false);
  const panelId = useId();
  const activeCount = [
    isPodcast ? null : genre,
    isPodcast ? null : mood,
    format,
  ].filter((value) => value !== null).length;
  const isOpen = !isPhone || isOpenOnPhone;
  return (
    <>
      {isPhone && (
        <Button
          variant="quiet"
          className={css.facetsToggle}
          aria-expanded={isOpenOnPhone}
          aria-controls={panelId}
          onClick={() => setIsOpenOnPhone((previous) => !previous)}
        >
          <FiSliders aria-hidden />
          {activeCount > 0
            ? t("studio:searchPage.facetsToggleCount", { count: activeCount })
            : t("studio:searchPage.facetsToggle")}
        </Button>
      )}
      <Collapse isOpen={isOpen}>
        <div id={panelId} className={css.facets}>
          <Collapse isOpen={!isPodcast}>
            <div className={css.facetRows}>
              <StudioSearchGenreSelect value={genre} onChange={onGenreChange} />
              <StudioSearchMoodSelect value={mood} onChange={onMoodChange} />
            </div>
          </Collapse>
          <div className={css.facetRows}>
            <StudioSearchFormatSelect
              value={format}
              onChange={onFormatChange}
            />
          </div>
        </div>
      </Collapse>
    </>
  );
}
