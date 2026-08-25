import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TABS, type ResultType } from "./search.data";
import { SearchResults } from "./SearchResults";
import { useSearchData } from "./api/useSearchData";
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
  const [tab, setTab] = useState<ResultType | "all">("all");
  const {
    data: searchData,
    recents,
    signInRequired,
    loading,
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
            <div className={styles.tabs}>
              {TABS.map((tabOption) => (
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
              ))}
            </div>
          )}
          <SearchResults
            query={query}
            tab={tab}
            setQuery={setQuery}
            onSelectTab={setTab}
            signInRequired={signInRequired}
            loading={showLoading}
            searchData={searchData}
            recents={recents}
          />
        </div>
      </div>
    </PageShell>
  );
}
