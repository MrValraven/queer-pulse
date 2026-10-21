import { useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { FiSearch } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchView } from "./api/studio.adapters";
import { useStudioSearchPages } from "./api/useStudioSearchPages";
import {
  STUDIO_LIMITS,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
  type StudioSearchType,
} from "./api/studio.types";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioSearchEmpty } from "./StudioSearchEmpty";
import { StudioSearchFacets, StudioSearchFilters } from "./StudioSearchFilters";
import { StudioSearchIdle } from "./StudioSearchIdle";
import { StudioSearchResults } from "./StudioSearchResults";
import { StudioShell } from "./StudioShell";
import {
  StudioShelfSkeleton,
  StudioTracklistSkeleton,
} from "./StudioSkeletons";
import { STUDIO_FADE } from "./studioMotion";
import { useStudioListeningPreferences } from "./player/useStudioPlayerPreferences";
import { STUDIO_SEARCH_ALL_VIEW_TRACKS } from "./studioSearch.data";
import { useStudioRecentSearches } from "./studioRecentSearches";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioSearchParams } from "./useStudioSearchParams";
import { studioSearchKeyShortcuts } from "./useStudioSearchShortcut";
import { useStudioShowcase } from "./useStudioShowcase";
import ss from "./studio.module.css";
import s from "./studioPages.module.css";

/** A result for an older term or filter dims to this while the new one
 *  loads (DES-39). */
const STALE_OPACITY = 0.55;

interface ShownSearch {
  result: StudioSearchView;
  query: string;
  type: StudioSearchType;
  genre: StudioGenre | null;
  mood: StudioMood | null;
  format: StudioFormat | null;
}

/** While a new term loads, the hook keeps the previous result. A fresh
 *  result object always answers the current query and filter, so remember
 *  which term each result belongs to and label the result with that one.
 *  Terms compare trimmed, as the hook queries with the trimmed text. A
 *  result for an older term or filter is stale: the page dims it. */
function useShownSearch(
  result: StudioSearchView | null,
  current: Omit<ShownSearch, "result">,
) {
  const [shownSearch, setShownSearch] = useState<ShownSearch | null>(null);
  if (result && shownSearch?.result !== result)
    setShownSearch({ result, ...current });
  const shown = result && shownSearch?.result === result ? shownSearch : null;
  const isRefreshing =
    shown !== null &&
    (shown.query !== current.query ||
      shown.type !== current.type ||
      shown.genre !== current.genre ||
      shown.mood !== current.mood ||
      shown.format !== current.format);
  return { shown, isRefreshing };
}

/** A pick: a link inside a result card or row (never "See all" in a shelf
 *  header, or Show more), a row's play button, or a card's play button. */
const RESULT_PICK_SELECTOR =
  "li a[href], button[data-studio-row-focus], button[data-state]";

/** Remembers the shown term once the member opens or plays a hit, so
 *  half-typed words never land in the recent list. A native listener, since
 *  the results wrapper is not itself interactive. */
function useRememberOnResultPick(
  term: string | null,
  remember: (term: string) => void,
) {
  const [resultsElement, setResultsElement] = useState<HTMLElement | null>(
    null,
  );
  useEffect(() => {
    if (!resultsElement || !term) return;
    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(RESULT_PICK_SELECTOR)
      )
        remember(term);
    };
    resultsElement.addEventListener("click", handleClick);
    return () => resultsElement.removeEventListener("click", handleClick);
  }, [resultsElement, term, remember]);
  return setResultsElement;
}

/** The result count, read out politely once a search settles. */
function SearchResultCount({ shown }: { shown: ShownSearch | null }) {
  const { t } = useTranslation();
  const { result } = shown ?? {};
  return (
    <div role="status" className={ss.visuallyHidden}>
      {shown && result && !result.isEmpty
        ? t("studio:searchPage.resultCount", {
            count:
              result.releases.length +
              (shown.type === "all"
                ? Math.min(result.tracks.length, STUDIO_SEARCH_ALL_VIEW_TRACKS)
                : result.tracks.length) +
              result.artists.length +
              result.playlists.length,
          })
        : ""}
    </div>
  );
}

export function StudioSearchPage() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isShowcase = useStudioShowcase();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    type,
    genre,
    mood,
    format,
    hrefWith,
    setQuery,
    setGenre,
    setMood,
    setFormat,
    clear,
  } = useStudioSearchParams();
  useStudioDocumentTitle(t("studio:searchPage.documentTitle"));
  const { areSingleKeyShortcutsOn } =
    useStudioListeningPreferences().preferences;
  const recentSearches = useStudioRecentSearches();
  // typedDraft is null while the input follows the URL, and holds the text
  // the member is typing until the URL catches up or changes.
  const [typedDraft, setTypedDraft] = useState<string | null>(null);
  const draft = typedDraft ?? query;
  const debouncedDraft = useDebouncedValue(draft, 300);
  // Podcasts carry no genre or mood: under Podcasts those filters drop.
  const isPodcast = format === "podcast";
  const searchedGenre = isPodcast ? null : genre;
  const searchedMood = isPodcast ? null : mood;
  const search = useStudioSearchPages(
    query,
    type,
    searchedGenre,
    searchedMood,
    format,
  );
  const { result, loadState, isIdle } = search;

  const [seenQuery, setSeenQuery] = useState(query);
  if (seenQuery !== query) {
    setSeenQuery(query);
    setTypedDraft(null);
  }

  const { shown, isRefreshing } = useShownSearch(result, {
    query: query.trim(),
    type,
    genre: searchedGenre,
    mood: searchedMood,
    format,
  });
  const isBusy = isRefreshing || (!isIdle && !shown && !loadState.isError);
  const setResultsElement = useRememberOnResultPick(
    shown?.query ?? null,
    recentSearches.remember,
  );

  // The input writes the URL once the typing has paused on the current text;
  // the URL (Back, a recent search) writes the input through the derived draft.
  useEffect(() => {
    if (
      typedDraft !== null &&
      debouncedDraft === typedDraft &&
      debouncedDraft !== query
    )
      setQuery(debouncedDraft, { isReplace: true });
  }, [debouncedDraft, typedDraft, query, setQuery]);

  // DES-39: motion owns the opacity, so the stale dim runs through it too
  // (a CSS opacity would lose to motion's inline style).
  const arrival = {
    initial: { opacity: 0 },
    animate: { opacity: isRefreshing ? STALE_OPACITY : 1 },
    transition: reducedMotion ? { duration: 0.12 } : STUDIO_FADE,
  };
  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:search.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:search.title"
            components={{ em: <em /> }}
          />
        </h1>
      </div>
      <form
        className={s.searchBar}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft !== query) setQuery(draft);
          setTypedDraft(null);
          recentSearches.remember(draft);
        }}
      >
        <FiSearch aria-hidden />
        <input
          ref={searchInputRef}
          type="search"
          value={draft}
          maxLength={STUDIO_LIMITS.searchQueryMax}
          aria-label={t("studio:searchPage.inputLabel")}
          aria-keyshortcuts={studioSearchKeyShortcuts(areSingleKeyShortcutsOn)}
          data-studio-search-input="page"
          placeholder={t("studio:shell.searchPlaceholderLive")}
          onChange={(event) => setTypedDraft(event.target.value)}
        />
        <span
          className={s.searchProgress}
          data-active={isBusy || undefined}
          aria-hidden="true"
        />
      </form>
      <StudioSearchFilters
        type={type}
        hrefFor={(nextType) => hrefWith({ type: nextType })}
      />
      <Collapse isOpen={!isIdle}>
        <StudioSearchFacets
          isPodcast={isPodcast}
          genre={genre}
          mood={mood}
          format={format}
          onGenreChange={setGenre}
          onMoodChange={setMood}
          onFormatChange={setFormat}
        />
      </Collapse>
      <SearchResultCount shown={isRefreshing ? null : shown} />
      {isIdle ? (
        <StudioSearchIdle
          recentSearches={recentSearches}
          isShowcase={isShowcase}
          hrefForTerm={(term) => hrefWith({ q: term })}
          format={format}
        />
      ) : loadState.isError ? (
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.searchResults"
        />
      ) : !shown ? (
        type === "tracks" ? (
          <StudioTracklistSkeleton
            label={t("studio:searchPage.loadingResults")}
          />
        ) : (
          <StudioShelfSkeleton label={t("studio:searchPage.loadingResults")} />
        )
      ) : shown.result.isEmpty ? (
        <m.div
          {...arrival}
          data-stale={isRefreshing || undefined}
          aria-busy={isRefreshing}
        >
          <StudioSearchEmpty
            query={shown.query}
            type={type}
            genre={searchedGenre}
            mood={searchedMood}
            format={format}
            hrefWith={hrefWith}
            onClear={() => {
              setTypedDraft(null);
              clear();
              searchInputRef.current?.focus();
            }}
          />
        </m.div>
      ) : (
        <m.div
          {...arrival}
          ref={setResultsElement}
          data-stale={isRefreshing || undefined}
          aria-busy={isRefreshing}
        >
          <StudioSearchResults
            result={shown.result}
            type={shown.type}
            format={shown.format}
            hrefFor={(nextType) => hrefWith({ type: nextType })}
            paging={search}
          />
        </m.div>
      )}
    </StudioShell>
  );
}
