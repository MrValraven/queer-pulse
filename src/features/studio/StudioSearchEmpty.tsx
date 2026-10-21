import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiSearch, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse, EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_FORMAT_LABEL_KEY,
  STUDIO_GENRE_LABEL_KEY,
} from "./api/studio.adapters";
import type {
  StudioFormat,
  StudioGenre,
  StudioMood,
  StudioSearchType,
} from "./api/studio.types";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import { STUDIO_SEARCH_FILTERS } from "./studioSearch.data";
import type { StudioSearchHrefPatch } from "./useStudioSearchParams";
import s from "./studioPages.module.css";
import css from "./StudioSearch.module.css";

interface DroppableFilter {
  id: string;
  label: string;
  patch: StudioSearchHrefPatch;
}

/** The filters this empty answer ran under, each one a chip that drops it
 *  and keeps the typed term. Under Podcasts genre and mood never applied,
 *  so they offer no chip. */
function useDroppableFilters({
  type,
  genre,
  mood,
  format,
}: {
  type: StudioSearchType;
  genre: StudioGenre | null;
  mood: StudioMood | null;
  format: StudioFormat | null;
}): DroppableFilter[] {
  const { t } = useTranslation();
  const filters: DroppableFilter[] = [];
  const typeFilter = STUDIO_SEARCH_FILTERS.find((filter) => filter.id === type);
  if (type !== "all" && typeFilter)
    filters.push({
      id: "type",
      label: t(typeFilter.labelKey),
      patch: { type: null },
    });
  if (format)
    filters.push({
      id: "format",
      label: t(STUDIO_FORMAT_LABEL_KEY[format]),
      patch: { format: null },
    });
  if (genre && format !== "podcast")
    filters.push({
      id: "genre",
      label: t(STUDIO_GENRE_LABEL_KEY[genre]),
      patch: { genre: null },
    });
  if (mood && format !== "podcast")
    filters.push({
      id: "mood",
      label: t(STUDIO_MOOD_LABEL_KEY[mood]),
      patch: { mood: null },
    });
  return filters;
}

/** DES-35: nothing matched. Each active filter is a chip that drops just
 *  that filter, so an over-narrowed search keeps its term; Clear search
 *  still starts over. */
export function StudioSearchEmpty({
  query,
  type,
  genre,
  mood,
  format,
  hrefWith,
  onClear,
}: {
  query: string;
  type: StudioSearchType;
  genre: StudioGenre | null;
  mood: StudioMood | null;
  format: StudioFormat | null;
  hrefWith: (patch: StudioSearchHrefPatch) => string;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const leadId = useId();
  const filters = useDroppableFilters({ type, genre, mood, format });
  const chipScale = reducedMotion ? 1 : 0.92;
  return (
    <div className={css.empty}>
      <EmptyState
        icon={<FiSearch />}
        headingLevel={2}
        title={t("studio:search.empty.title")}
        description={
          <Translation
            i18nKey={
              filters.length > 0
                ? "studio:searchPage.emptyFiltered"
                : "studio:search.empty.description"
            }
            components={{ em: <em /> }}
            values={{ term: query }}
          />
        }
        action={{ label: t("studio:searchPage.clearCta"), onClick: onClear }}
      />
      <Collapse isOpen={filters.length > 0}>
        <div className={css.dropFilters} role="group" aria-labelledby={leadId}>
          <p id={leadId} className={css.dropFiltersLead}>
            {t("studio:searchPage.dropFilterLead")}
          </p>
          <ul className={s.chips}>
            <AnimatePresence initial={false} mode="popLayout">
              {filters.map((filter) => (
                <m.li
                  key={filter.id}
                  initial={{ opacity: 0, scale: chipScale }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: chipScale,
                    transition: STUDIO_EXIT,
                  }}
                  transition={reducedMotion ? { duration: 0.12 } : STUDIO_FADE}
                >
                  <Link
                    to={hrefWith(filter.patch)}
                    className={`${s.chip} ${s.chipDrop}`}
                    aria-label={t("studio:searchPage.dropFilter", {
                      filter: filter.label,
                    })}
                  >
                    {filter.label}
                    <FiX aria-hidden />
                  </Link>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </Collapse>
    </div>
  );
}
