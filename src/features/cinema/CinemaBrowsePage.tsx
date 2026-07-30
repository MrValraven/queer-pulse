import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiFilm } from "react-icons/fi";
import { EmptyState, FadeIn, ImageSlot } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CinemaShell } from "./CinemaShell";
import { CinemaLiveCatalog } from "./CinemaLiveCatalog";
import { CinemaBrowseGridSkeleton } from "./CinemaBrowseSkeleton";
import { CinemaBrowseSidebar, SortDropdown } from "./CinemaBrowseControls";
import {
  ACCESS_FILTERS,
  ACCESSIBILITY_OPTIONS,
  browsePoster,
  COUNTRY_OPTIONS,
  emptyFilters,
  filterFilms,
  FILM_CATALOGUE_COUNT,
  FORMAT_OPTIONS,
  MADE_BY_OPTIONS,
  MOOD_OPTIONS,
  sortFilms,
  type BrowseFilters,
  type SortKey,
} from "./cinemaBrowse.data";
import { accessLabel, formatLabel, type CinemaFilm } from "./data";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import styles from "./CinemaBrowsePage.module.css";
import { routes } from "../../app/routeMap";

const accessClass = {
  free: styles.free,
  member: styles.member,
  rent: styles.rent,
};

type SetKey = "access" | "madeBy" | "country" | "accessibility" | "mood";

/** Every filter option across groups, for resolving a stored (canonical,
 * untranslated) filter value back to its display label. */
const ALL_FILTER_OPTIONS: { value: string; labelKey: string }[] = [
  ...ACCESS_FILTERS,
  ...FORMAT_OPTIONS,
  ...MADE_BY_OPTIONS,
  ...COUNTRY_OPTIONS,
  ...ACCESSIBILITY_OPTIONS,
  ...MOOD_OPTIONS,
];

/** Returns a copy of the set without `value` (unchanged if absent). */
function dropFrom<T>(set: Set<T>, value: T): Set<T> {
  if (!set.has(value)) return set;
  const next = new Set(set);
  next.delete(value);
  return next;
}

function FilmCard({
  film,
  t,
  fmt,
}: {
  film: CinemaFilm;
  t: TFunction;
  fmt: Formatters;
}) {
  return (
    <Link to={routes.film} className={styles.fc}>
      <div className={styles.fcPoster}>
        <ImageSlot
          src={browsePoster(film)}
          tint={film.tint}
          width="100%"
          height="100%"
          radius={14}
          placeholder={t("cinema:slot.poster")}
          style={{ position: "absolute", inset: 0 }}
        />
        <span className={`${styles.fcBadge} ${accessClass[film.access]}`}>
          {accessLabel(film, t, fmt)}
        </span>
        <div className={styles.fcSaves}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>
      <div className={styles.fcEb}>
        {formatLabel(film.format, t)} · {film.meta.split("·").pop()?.trim()}
      </div>
      <div className={styles.fcTitle}>
        {film.titlePre}
        {film.titleEm && <em>{film.titleEm}</em>}
        {film.titlePost}
      </div>
      <div className={styles.fcMeta}>
        {film.meta.split("·")[0]!.trim()} · {film.country} · {film.year}
      </div>
      <div className={styles.fcTags}>
        {film.subs.map((s) => (
          <span key={s} className={styles.fcTag}>
            {s}
          </span>
        ))}
      </div>
      <div className={styles.fcCurator}>
        <span className={styles.by}>{film.by}</span> — {film.note.slice(0, 48)}…
      </div>
    </Link>
  );
}

/**
 * The browse/programme catalogue. Demo mode keeps the full mock experience
 * (rich filters, sort, curator notes) below; live mode renders the real
 * catalog from GET /cinema/titles via `CinemaLiveCatalog`.
 */
export function CinemaBrowsePage() {
  const { demoMode } = useDemoMode();
  if (!demoMode) return <CinemaLiveCatalog />;
  return <DemoCinemaBrowsePage />;
}

function DemoCinemaBrowsePage() {
  const loading = useSimulatedLoad();
  const [filters, setFilters] = useState<BrowseFilters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("curated");
  const { t } = useTranslation();
  const fmt = useFormat();

  const visible = useMemo(
    () => sortFilms(filterFilms(filters), sort),
    [filters, sort],
  );

  function toggleSet(key: SetKey, value: string) {
    setFilters((cur) => {
      const next = new Set(cur[key]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...cur, [key]: next };
    });
  }

  function setFormat(value: string) {
    setFilters((cur) => ({
      ...cur,
      format: cur.format === value ? null : value,
    }));
  }

  function removeChip(label: string) {
    setFilters((cur) => {
      if (cur.format === label) return { ...cur, format: null };
      return {
        ...cur,
        madeBy: dropFrom(cur.madeBy, label),
        country: dropFrom(cur.country, label),
        accessibility: dropFrom(cur.accessibility, label),
        mood: dropFrom(cur.mood, label),
      };
    });
  }

  const clearAll = () => setFilters(emptyFilters());

  /** Stored filter values are canonical (untranslated); resolve each to its
   * value/displayLabel pair so the active-chips row shows translated text
   * while `removeChip`/`toggleSet` keep matching on the untranslated value. */
  const activeChips: { value: string; label: string }[] = [
    ...[...filters.access].map((value) => ({
      value,
      label: t(
        ALL_FILTER_OPTIONS.find((x) => x.value === value)?.labelKey ?? "",
      ),
    })),
    ...(filters.format
      ? [
          {
            value: filters.format,
            label: t(
              ALL_FILTER_OPTIONS.find((x) => x.value === filters.format)
                ?.labelKey ?? "",
            ),
          },
        ]
      : []),
    ...[
      ...filters.madeBy,
      ...filters.country,
      ...filters.accessibility,
      ...filters.mood,
    ].map((value) => ({
      value,
      label: t(
        ALL_FILTER_OPTIONS.find((x) => x.value === value)?.labelKey ?? "",
      ),
    })),
  ];

  return (
    <CinemaShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>
            {t("cinema:browse.hero.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="cinema:browse.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("cinema:browse.hero.lead", { count: FILM_CATALOGUE_COUNT })}</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <CinemaBrowseSidebar
              filters={filters}
              toggleSet={toggleSet}
              setFormat={setFormat}
              onClear={clearAll}
            />

            <div>
              {activeChips.length > 0 && (
                <div className={styles.activeFilters}>
                  <span className={styles.afLabel}>
                    {t("cinema:browse.activeLabel")}
                  </span>
                  {activeChips.map((chip) => (
                    <span key={chip.value} className={styles.afChip}>
                      {chip.label}{" "}
                      <span
                        className={styles.x}
                        role="button"
                        tabIndex={0}
                        aria-label={t("cinema:browse.removeChipAriaLabel", {
                          chip: chip.label,
                        })}
                        onClick={() => {
                          const isAccess = ACCESS_FILTERS.some(
                            (a) => a.value === chip.value,
                          );
                          if (isAccess) toggleSet("access", chip.value);
                          else removeChip(chip.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            const isAccess = ACCESS_FILTERS.some(
                              (a) => a.value === chip.value,
                            );
                            if (isAccess) toggleSet("access", chip.value);
                            else removeChip(chip.value);
                          }
                        }}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.sortBar}>
                <div className={styles.results} aria-live="polite">
                  <Translation
                    i18nKey="cinema:browse.results.showing"
                    values={{ count: visible.length }}
                    components={{ strong: <strong /> }}
                  />
                  {activeChips.length > 0
                    ? t("cinema:browse.results.matchingFilters")
                    : t("cinema:browse.results.inCatalogue")}
                </div>
                <SortDropdown value={sort} onChange={setSort} />
              </div>

              {loading ? (
                <CinemaBrowseGridSkeleton count={6} />
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={<FiFilm />}
                  title={t("cinema:browse.empty.title")}
                  description={t("cinema:browse.empty.description")}
                  action={{
                    label: t("cinema:browse.empty.clearCta"),
                    onClick: clearAll,
                  }}
                />
              ) : (
                <div className={styles.grid}>
                  {visible.map((film, i) => (
                    <FadeIn key={film.id} delay={Math.min(i, 8) * 60}>
                      <FilmCard film={film} t={t} fmt={fmt} />
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </CinemaShell>
  );
}
