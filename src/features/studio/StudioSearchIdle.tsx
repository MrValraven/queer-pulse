import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioFormat } from "./api/studio.types";
import { useStudioGenres } from "./api/useStudioGenres";
import { useStudioMoods } from "./api/useStudioMoods";
import { useStudioReleases } from "./api/useStudioReleases";
import { StudioFacetTiles } from "./StudioFacetTiles";
import { StudioShelf } from "./kit/StudioShelf";
import shelfCss from "./kit/StudioShelf.module.css";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioShelfSkeleton } from "./StudioSkeletons";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import { STUDIO_SEARCH_SUGGESTION_KEYS } from "./studioSearch.data";
import type { StudioRecentSearches } from "./studioRecentSearches";
import s from "./studioPages.module.css";
import css from "./StudioSearch.module.css";

const FEATURED_COUNT = 8;

/** DES-40: the member's recent searches on this device, newest first, each
 *  a link back into that search, with Clear beside them. The demo
 *  showcase seeds suggestions while the device has none of its own. */
function RecentSearches({
  recentSearches,
  isShowcase,
  hrefForTerm,
}: {
  recentSearches: StudioRecentSearches;
  isShowcase: boolean;
  hrefForTerm: (term: string) => string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const hasOwnTerms = recentSearches.terms.length > 0;
  const suggestions = isShowcase
    ? STUDIO_SEARCH_SUGGESTION_KEYS.map((key) => t(key))
    : [];
  const terms = hasOwnTerms ? recentSearches.terms : suggestions;
  const enterScale = reducedMotion ? 1 : 0.92;
  const fade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;
  const presence = {
    initial: { opacity: 0, scale: enterScale },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: enterScale, transition: STUDIO_EXIT },
    transition: fade,
  };
  return (
    <Collapse isOpen={terms.length > 0}>
      <section className={css.recent} aria-labelledby={headingId}>
        <div className={css.recentHead}>
          <h2 id={headingId} className={css.recentTitle}>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={hasOwnTerms ? "recent" : "suggestions"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: STUDIO_EXIT }}
                transition={fade}
              >
                {hasOwnTerms
                  ? t("studio:searchPage.recentHeading")
                  : t("studio:searchPage.suggestionsHeading")}
              </m.span>
            </AnimatePresence>
          </h2>
          <AnimatePresence initial={false}>
            {hasOwnTerms && (
              <m.span key="clear" {...presence}>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={recentSearches.clear}
                >
                  {t("studio:searchPage.recentClear")}
                </Button>
              </m.span>
            )}
          </AnimatePresence>
        </div>
        <ul className={s.chips}>
          <AnimatePresence initial={false} mode="popLayout">
            {terms.map((term) => (
              <m.li
                key={`${hasOwnTerms ? "own" : "seed"}-${term}`}
                {...presence}
              >
                <Link
                  to={hrefForTerm(term)}
                  className={s.chip}
                  onClick={() => recentSearches.remember(term)}
                >
                  {hasOwnTerms && <FiClock aria-hidden />}
                  {term}
                </Link>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
        <Collapse isOpen={hasOwnTerms}>
          <p className={css.recentNote}>{t("studio:searchPage.recentNote")}</p>
        </Collapse>
      </section>
    </Collapse>
  );
}

/** A shelf header over a state that is not cards yet (loading, failed). */
function FeaturedFrame({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className={shelfCss.shelf} aria-labelledby={headingId}>
      <header className={shelfCss.head}>
        <div className={shelfCss.headText}>
          <h2 id={headingId} className={shelfCss.title}>
            {title}
          </h2>
        </div>
      </header>
      {children}
    </section>
  );
}

/** DES-40: "Featured now" with its own loading and error states, so a
 *  failed read names the reason and offers Retry instead of leaving a
 *  heading over an empty grid. */
function FeaturedNow() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const shelfId = useId();
  const featured = useStudioReleases();
  const title = (
    <Translation
      i18nKey="studio:search.results.featuredNow"
      components={{ em: <em /> }}
    />
  );
  const releases = featured.releases.slice(0, FEATURED_COUNT);
  const phase = featured.loadState.isError
    ? "error"
    : featured.loadState.isLoading
      ? "loading"
      : "ready";
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: STUDIO_EXIT }}
        transition={reducedMotion ? { duration: 0.12 } : STUDIO_FADE}
      >
        {phase === "error" ? (
          <FeaturedFrame title={title}>
            <StudioLoadError
              loadState={featured.loadState}
              what="studio:errors.what.featured"
            />
          </FeaturedFrame>
        ) : phase === "loading" ? (
          <FeaturedFrame title={title}>
            <StudioShelfSkeleton
              cards={FEATURED_COUNT}
              label={t("studio:searchPage.featuredLoading")}
            />
          </FeaturedFrame>
        ) : releases.length > 0 ? (
          <StudioShelf id={shelfId} title={title}>
            {releases.map((release) => (
              <StudioReleaseCard key={release.id} release={release} />
            ))}
          </StudioShelf>
        ) : null}
      </m.div>
    </AnimatePresence>
  );
}

/** DES-31: a way into browse before a term, as C1's two-row genre and
 *  mood tiles. Only published values come back from the browse queries, a
 *  row folds away when its list is empty or fails, and every tile keeps the
 *  active `?format`. Podcasts carry no genre or mood, so both fold there. */
function BrowseTiles({ format }: { format: StudioFormat | null }) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const {
    genres,
    coverByGenre,
    loadState: genresLoadState,
  } = useStudioGenres();
  const { moods, coverByMood, loadState: moodsLoadState } = useStudioMoods();
  const isPodcast = format === "podcast";
  return (
    <>
      <Collapse
        isOpen={!isPodcast && (genresLoadState.isLoading || genres.length > 0)}
      >
        <StudioFacetTiles
          id={`${idPrefix}-genres`}
          title={
            <Translation
              i18nKey="studio:home.genres.heading"
              components={{ em: <em /> }}
            />
          }
          facet={{ kind: "genre", values: genres, coverByValue: coverByGenre }}
          label={t("studio:home.genres.listLabel")}
          activeFormat={format}
          isLoading={genresLoadState.isLoading}
        />
      </Collapse>
      <Collapse
        isOpen={!isPodcast && (moodsLoadState.isLoading || moods.length > 0)}
      >
        <StudioFacetTiles
          id={`${idPrefix}-moods`}
          title={
            <Translation
              i18nKey="studio:home.moods.heading"
              components={{ em: <em /> }}
            />
          }
          facet={{ kind: "mood", values: moods, coverByValue: coverByMood }}
          label={t("studio:home.moods.listLabel")}
          activeFormat={format}
          isLoading={moodsLoadState.isLoading}
        />
      </Collapse>
    </>
  );
}

/** The search page before a term: recent searches, the browse tiles, then
 *  "Featured now". */
export function StudioSearchIdle({
  recentSearches,
  isShowcase,
  hrefForTerm,
  format,
}: {
  recentSearches: StudioRecentSearches;
  isShowcase: boolean;
  hrefForTerm: (term: string) => string;
  /** The active `?format`, carried into every browse tile. */
  format: StudioFormat | null;
}) {
  return (
    <>
      <RecentSearches
        recentSearches={recentSearches}
        isShowcase={isShowcase}
        hrefForTerm={hrefForTerm}
      />
      <BrowseTiles format={format} />
      <FeaturedNow />
    </>
  );
}
