import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchView } from "./api/studio.adapters";
import { useStudioReleases } from "./api/useStudioReleases";
import { useStudioSearch } from "./api/useStudioSearch";
import { STUDIO_LIMITS, type StudioSearchType } from "./api/studio.types";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioSearchFilters } from "./StudioSearchFilters";
import { StudioSearchResults } from "./StudioSearchResults";
import { StudioShell } from "./StudioShell";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { RECENT } from "./studioSearch.data";
import { useStudioSearchParams } from "./useStudioSearchParams";
import { useStudioShowcase } from "./useStudioShowcase";
import ss from "./studio.module.css";
import s from "./studioPages.module.css";

const FEATURED_COUNT = 8;

interface ShownSearch {
  result: StudioSearchView;
  query: string;
  type: StudioSearchType;
}

export function StudioSearchPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { query, type, setQuery, setType, clear } = useStudioSearchParams();
  // typedDraft is null while the input follows the URL, and holds the text
  // the member is typing until the URL catches up or changes.
  const [typedDraft, setTypedDraft] = useState<string | null>(null);
  const draft = typedDraft ?? query;
  const debouncedDraft = useDebouncedValue(draft, 300);
  const { result, loadState, isIdle } = useStudioSearch(query, type);
  const featured = useStudioReleases();

  const [seenQuery, setSeenQuery] = useState(query);
  if (seenQuery !== query) {
    setSeenQuery(query);
    setTypedDraft(null);
  }

  // While a new term loads, useStudioSearch keeps the previous result. A fresh
  // result object always answers the current query and filter, so remember
  // which term each result belongs to and label the result with that one.
  // Terms compare trimmed, as the hook queries with the trimmed text.
  const trimmedQuery = query.trim();
  const [shownSearch, setShownSearch] = useState<ShownSearch | null>(null);
  if (result && shownSearch?.result !== result)
    setShownSearch({ result, query: trimmedQuery, type });
  const shown = result && shownSearch?.result === result ? shownSearch : null;
  const isRefreshing =
    shown !== null && (shown.query !== trimmedQuery || shown.type !== type);

  // The input writes the URL once the typing has paused on the current text;
  // the URL (Back, the topbar search) writes the input through the derived draft.
  useEffect(() => {
    if (
      typedDraft !== null &&
      debouncedDraft === typedDraft &&
      debouncedDraft !== query
    )
      setQuery(debouncedDraft, { isReplace: true });
  }, [debouncedDraft, typedDraft, query, setQuery]);

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
        }}
      >
        <FiSearch aria-hidden />
        <input
          ref={searchInputRef}
          type="search"
          value={draft}
          maxLength={STUDIO_LIMITS.searchQueryMax}
          aria-label={t("studio:searchPage.inputLabel")}
          placeholder={t("studio:shell.searchPlaceholderLive")}
          onChange={(event) => setTypedDraft(event.target.value)}
        />
      </form>
      <StudioSearchFilters type={type} onChange={setType} />
      {isShowcase && isIdle && (
        <div className={s.chips}>
          {RECENT.map((term) => (
            <button
              key={term}
              type="button"
              className={s.chip}
              onClick={() => setTypedDraft(term)}
            >
              {term}
            </button>
          ))}
        </div>
      )}
      <div role="status" className={ss.visuallyHidden}>
        {shown && !isRefreshing && !shown.result.isEmpty
          ? t("studio:searchPage.resultCount", {
              count:
                shown.result.releases.length +
                shown.result.tracks.length +
                shown.result.artists.length,
            })
          : ""}
      </div>
      {isIdle ? (
        <section className={ss.row}>
          <div className={ss.rowH}>
            <h2>
              <Translation
                i18nKey="studio:search.results.featuredNow"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          {featured.loadState.isLoading ? (
            <StudioCardGridSkeleton
              count={FEATURED_COUNT}
              className={ss.rowGrid}
            />
          ) : (
            <div className={ss.rowGrid}>
              {featured.releases.slice(0, FEATURED_COUNT).map((release) => (
                <StudioReleaseCard key={release.id} release={release} />
              ))}
            </div>
          )}
        </section>
      ) : loadState.isError ? (
        <StudioLoadError loadState={loadState} />
      ) : !shown ? (
        <StudioCardGridSkeleton count={FEATURED_COUNT} className={ss.rowGrid} />
      ) : (
        <div aria-busy={isRefreshing}>
          <StudioSearchResults
            result={shown.result}
            query={shown.query}
            type={shown.type}
            onClear={() => {
              setTypedDraft(null);
              clear();
              searchInputRef.current?.focus();
            }}
          />
        </div>
      )}
    </StudioShell>
  );
}
