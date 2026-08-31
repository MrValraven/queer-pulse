import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../app/routeMap";
import { Group } from "./SearchResultCard";
import { SearchLoadMore } from "./SearchLoadMore";
import type { LiveResultType } from "./api/search.api";
import {
  TYPE_LABEL_KEY,
  NO_LIVE_SEARCH_TYPES,
  SEARCH_PER_TYPE_CAP,
  SEARCH_TAB_PAGE_SIZE,
  type ResultType,
  type SearchItem,
} from "./search.data";
import styles from "./SearchPage.module.css";

/** Loading placeholder mirroring ResultCard — same icon + two lines. */
function ResultSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine
        width={42}
        height={42}
        style={{ borderRadius: 11, flex: "none" }}
      />
      <div className={styles.cardBody}>
        <SkeletonLine width="30%" height={11} />
        <SkeletonLine width="70%" height={15} style={{ marginTop: 6 }} />
        <SkeletonLine width="55%" height={13} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

function SkeletonGroup() {
  return (
    <div className={styles.section}>
      <SkeletonLine width={120} height={12} style={{ marginBottom: 16 }} />
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Live-mode logged-out state — search requires a session. */
function SearchSignInPrompt() {
  const { t } = useTranslation();
  return (
    <div className={styles.comingSoon}>
      <span className={styles.comingSoonBadge}>
        {t("members:search.signInRequired.badge")}
      </span>
      <h2 className={styles.comingSoonTitle}>
        <Translation
          i18nKey="members:search.signInRequired.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.comingSoonText}>
        {t("members:search.signInRequired.body")}
      </p>
      <Button variant="primary" to={routes.signIn}>
        {t("nav:signIn")}
      </Button>
    </div>
  );
}

/** The browse/recent view shown when there's no active query. */
function BrowseView({
  searchData,
  recents,
  setQuery,
  tab,
}: {
  searchData: SearchItem[];
  recents: string[];
  setQuery: (value: string) => void;
  tab: ResultType | "all";
}) {
  const { t } = useTranslation();
  return (
    <>
      {/* A first-time member has no recents at all. The whole block stays away
          until there is one, rather than heading an empty row (DES-31). */}
      {recents.length > 0 && (
        <div className={styles.recent}>
          <div className={styles.recentLabel}>
            {t("members:search.recentSearches")}
          </div>
          <div className={styles.recentChips}>
            {recents.map((recentQuery) => (
              <button
                key={recentQuery}
                type="button"
                className={styles.chip}
                onClick={() => setQuery(recentQuery)}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-6.93" />
                </svg>
                {recentQuery}
              </button>
            ))}
          </div>
        </div>
      )}
      {tab === "all" ? (
        <>
          <Group
            items={searchData.filter((d) => d.t === "topic")}
            label={t("members:search.browseTopics")}
          />
          <Group
            items={searchData.filter((d) => d.t === "member").slice(0, 6)}
            label={t(TYPE_LABEL_KEY.member)}
          />
          <Group
            items={searchData.filter((d) => d.t === "event")}
            label={t("members:search.upcomingEvents")}
          />
          <Group
            items={searchData.filter((d) => d.t === "page")}
            label={t(TYPE_LABEL_KEY.page)}
          />
        </>
      ) : (
        // A specific tab is selected with no query: show that type's full list,
        // so e.g. the Pages tab becomes a complete jump-to launcher.
        <Group
          items={searchData.filter((d) => d.t === tab)}
          label={t(TYPE_LABEL_KEY[tab])}
        />
      )}
    </>
  );
}

/** The active-query results view: optional topic jump, count, hits by type. */
function HitsView({
  query,
  q,
  tab,
  searchData,
  onSelectTab,
}: {
  query: string;
  q: string;
  tab: ResultType | "all";
  searchData: SearchItem[];
  onSelectTab: (type: ResultType) => void;
}) {
  const { t } = useTranslation();
  const hits = searchData.filter((d) => {
    const isMatch = `${d.name} ${d.sub} ${d.kw}`.toLowerCase().includes(q);
    return isMatch && (tab === "all" || d.t === tab);
  });
  // When the query is a bare "#tag" matching a known topic, offer a direct
  // jump to its feed page above the ordinary results.
  const topicJump = q.startsWith("#")
    ? searchData.find((d) => d.t === "topic" && d.name.toLowerCase() === q)
    : undefined;
  const banner = topicJump ? (
    <Link to={linkToPath(topicJump.href)} className={styles.jump}>
      <span className={styles.jumpText}>
        <Translation
          i18nKey="members:search.jumpTo"
          components={{ b: <b /> }}
          values={{ name: topicJump.name }}
        />
      </span>
      <span className={styles.jumpArrow} aria-hidden>
        <FiArrowRight />
      </span>
    </Link>
  ) : null;
  const countEl = (
    <div className={styles.count}>
      <Translation
        i18nKey="members:search.resultCount"
        components={{ b: <b /> }}
        values={{ count: hits.length, query: query.trim() }}
      />
    </div>
  );
  if (!hits.length) {
    return (
      <>
        {banner}
        {countEl}
        <div className={styles.empty}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--plum)"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <h3>{t("members:search.empty.title")}</h3>
          <p>{t("members:search.empty.body")}</p>
        </div>
      </>
    );
  }
  if (tab === "all") {
    const types: ResultType[] = [
      "topic",
      "member",
      "community",
      "event",
      "forum",
      "forumPost",
      "business",
      "magazine",
      "job",
      "housing",
      "resource",
      "subprofile",
      "board",
      "page",
    ];
    return (
      <>
        {banner}
        {countEl}
        {types.map((typ) => {
          const typeHits = hits.filter((h) => h.t === typ);
          // A type that came back exactly at its per-type cap may have more
          // results the merged "all" view is silently hiding — switching to
          // that type's own tab re-queries the backend at a much higher
          // limit for just that one type (see `useSearchData`'s `liveType`).
          const atCap =
            typeHits.length >= SEARCH_PER_TYPE_CAP &&
            !NO_LIVE_SEARCH_TYPES.has(typ);
          return (
            <Group
              key={typ}
              items={typeHits}
              label={t(TYPE_LABEL_KEY[typ])}
              onSeeAll={atCap ? () => onSelectTab(typ) : undefined}
            />
          );
        })}
      </>
    );
  }
  // A single category tab. Once it comes back exactly full, there is a next
  // page to fetch by offset rather than a cap to stop at (SOC-08).
  // `tab` is already narrowed to a single `ResultType` here: the "all" branch
  // returned above.
  const canPage =
    !NO_LIVE_SEARCH_TYPES.has(tab) && hits.length >= SEARCH_TAB_PAGE_SIZE;
  return (
    <>
      {banner}
      {countEl}
      <Group items={hits} label={t(TYPE_LABEL_KEY[tab])}>
        {canPage && (
          <SearchLoadMore query={query.trim()} type={tab as LiveResultType} />
        )}
      </Group>
    </>
  );
}

/**
 * Search results body. Four distinguishable states, in order: sign-in prompt,
 * loading skeletons, a failed request, then browse or query hits. The failed
 * request gets its own panel so an outage is never dressed up as
 * `0 results for "maria"` (DES-23).
 */
export function SearchResults({
  query,
  tab,
  setQuery,
  onSelectTab,
  signInRequired,
  loading,
  hasFailed,
  onRetry,
  searchData,
  recents,
}: {
  query: string;
  tab: ResultType | "all";
  setQuery: (value: string) => void;
  /** Switches the active tab — wired to the "see all in [category]" links in
   *  the "all" view once a type is at its per-type cap (DISC-10). */
  onSelectTab: (type: ResultType) => void;
  signInRequired: boolean;
  loading: boolean;
  /** The live GET /search failed. Renders the retryable error panel. */
  hasFailed: boolean;
  /** Re-runs the failed search. */
  onRetry: () => void;
  searchData: SearchItem[];
  recents: string[];
}) {
  const { t } = useTranslation();
  const q = query.trim().toLowerCase();
  if (signInRequired) return <SearchSignInPrompt />;
  if (loading) {
    return (
      <>
        <SkeletonGroup />
        <SkeletonGroup />
      </>
    );
  }
  if (hasFailed) {
    return (
      <LoadErrorState
        onRetry={onRetry}
        title={
          <Translation
            i18nKey="members:search.loadError.title"
            components={{ em: <em /> }}
          />
        }
        description={t("members:search.loadError.body")}
      />
    );
  }
  if (!q) {
    return (
      <BrowseView
        searchData={searchData}
        recents={recents}
        setQuery={setQuery}
        tab={tab}
      />
    );
  }
  return (
    <HitsView
      query={query}
      q={q}
      tab={tab}
      searchData={searchData}
      onSelectTab={onSelectTab}
    />
  );
}
