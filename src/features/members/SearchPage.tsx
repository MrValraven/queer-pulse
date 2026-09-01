import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { LoadErrorState, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TABS, visibleSearchTabs, type ResultType } from "./search.data";
import { SearchResults } from "./SearchResults";
import { useSearchData } from "./api/useSearchData";
import { useSearchTypes } from "./api/useSearchTypes";
import { pushRecent } from "./searchRecents";
import styles from "./SearchPage.module.css";

export function SearchPage() {
  const { t } = useTranslation();
  // The query lives in the URL (?q=…) so it's shareable, bookmarkable, and can be
  // pre-filled by the global ⌘K command palette.
  const { demoMode } = useDemoMode();
  const simulatedLoad = useSimulatedLoad();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  // What the member last clicked. The tab actually rendered is derived from
  // it below, because a category can stop existing under them.
  const [requestedTab, setTab] = useState<ResultType | "all">("all");
  // Which categories exist at all is a backend answer, because a result type
  // whose feature is closed is never queried and never returned: its tab
  // could only ever show the empty state, which reads as "nothing matched"
  // rather than "this surface is not open". Demo mode keeps the whole strip,
  // its corpus fills every tab.
  const {
    launchedTypes,
    isPending: isLoadingTabs,
    isError: hasTabsFailed,
    refetch: retryTabs,
  } = useSearchTypes();
  const tabs = useMemo(
    () => (demoMode ? TABS : visibleSearchTabs(launchedTypes)),
    [demoMode, launchedTypes],
  );
  // A tab can stop existing under the member: the strip is short until the
  // types answer lands, and a deploy can close a feature while the page is
  // open. Deriving the active tab rather than resetting the stored one keeps
  // them on a tab that renders, and gives their choice back the moment the
  // category reappears (a retry, say) instead of silently forgetting it.
  const tab = tabs.some((tabOption) => tabOption.id === requestedTab)
    ? requestedTab
    : "all";
  const {
    data: searchData,
    recents,
    signInRequired,
    loading,
    isError: hasSearchFailed,
    refetch: retrySearch,
  } = useSearchData(query, tab);
  // The prototype's fake fetch delay is DEMO-ONLY. In live mode `useSearchData`
  // reports real loading, so OR-ing this in only added 600ms of skeleton to
  // every visit, including ones react-query could answer from cache.
  const showLoading = loading || (demoMode && simulatedLoad);
  const setQuery = (value: string) =>
    setSearchParams(value ? { q: value } : {}, { replace: true });

  return (
    <PageShell>
      <header className={styles.hero} data-plum>
        <div className="wrap">
          <div className={styles.label}>{t("members:search.hero.label")}</div>
          <h1 className={styles.title}>
            <Translation
              i18nKey="members:search.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          {!signInRequired && (
            <div className={styles.barWrap}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className={styles.barInput}
                type="text"
                enterKeyHint="search"
                placeholder={t("members:search.hero.placeholder")}
                aria-label={t("members:search.hero.placeholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    pushRecent(query.trim());
                  }
                }}
              />
              <span className={styles.shortcut}>⌘K</span>
            </div>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <div className="wrap">
          {!signInRequired && (
            <>
              <div className={styles.tabs}>
                {isLoadingTabs ? (
                  <SkeletonLine width={320} height={34} />
                ) : (
                  tabs.map((tabOption) => (
                    <button
                      key={tabOption.id}
                      type="button"
                      className={[
                        styles.tab,
                        tab === tabOption.id && styles.tabActive,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setTab(tabOption.id)}
                    >
                      {t(tabOption.labelKey)}
                    </button>
                  ))
                )}
              </div>
              {/* The categories could not be looked up. Search itself still
                  works and the merged view groups whatever comes back, so the
                  honest answer is to say the strip is short and offer a retry,
                  never to guess the list back or drop it silently. */}
              {hasTabsFailed && (
                <LoadErrorState
                  compact
                  onRetry={retryTabs}
                  title={
                    <Translation
                      i18nKey="members:search.tabsError.title"
                      components={{ em: <em /> }}
                    />
                  }
                  description={t("members:search.tabsError.body")}
                />
              )}
            </>
          )}
          <SearchResults
            query={query}
            tab={tab}
            setQuery={setQuery}
            onSelectTab={setTab}
            signInRequired={signInRequired}
            loading={showLoading}
            hasFailed={hasSearchFailed}
            onRetry={retrySearch}
            searchData={searchData}
            recents={recents}
          />
        </div>
      </div>
    </PageShell>
  );
}
