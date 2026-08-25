import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { ImageSlot, FadeIn, EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import { FILTERS, RECENT, RESULTS } from "./studioSearch.data";
import ss from "./studio.module.css";
import s from "./studioPages.module.css";

function SearchResultSkeleton() {
  return (
    <div className={ss.skelCard}>
      <div className={`${ss.skel} ${ss.skelCover}`} />
      <div
        className={ss.skel}
        style={{ width: "80%", height: 15, marginTop: 2 }}
      />
      <div className={ss.skel} style={{ width: "55%", height: 12 }} />
    </div>
  );
}

export function StudioSearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Everything");
  const loading = useSimulatedLoad();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESULTS.filter((result) => {
      const matchFilter = filter === "Everything" || result.kind === filter;
      const matchQuery =
        !q ||
        `${result.pre}${result.em ?? ""}${result.post ?? ""} ${result.meta}`
          .toLowerCase()
          .includes(q);
      return matchFilter && matchQuery;
    });
  }, [query, filter]);

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

      <div className={s.searchBar}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <circle cx={11} cy={11} r={7} />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          aria-label={t("studio:search.inputPlaceholder")}
          placeholder={t("studio:search.inputPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className={s.chips}>
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${s.chip} ${filter === option.id ? s.chipOn : ""}`}
            onClick={() => setFilter(option.id)}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      {!query && (
        <div className={s.chips}>
          {RECENT.map((term) => (
            <button
              key={term}
              type="button"
              className={s.chip}
              onClick={() => setQuery(term)}
            >
              {term}
            </button>
          ))}
        </div>
      )}

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            {query ? (
              <Translation
                i18nKey="studio:search.results.forQuery"
                components={{ em: <em /> }}
                values={{ query }}
              />
            ) : (
              <Translation
                i18nKey="studio:search.results.featuredNow"
                components={{ em: <em /> }}
              />
            )}
          </h2>
        </div>
        {loading ? (
          <div className={ss.rowGrid}>
            {Array.from({ length: 8 }).map((_, skeletonIndex) => (
              <SearchResultSkeleton key={skeletonIndex} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<FiSearch />}
            title={t("studio:search.empty.title")}
            description={
              <Translation
                i18nKey="studio:search.empty.description"
                components={{ em: <em /> }}
                values={{
                  term:
                    query ||
                    t(
                      FILTERS.find((option) => option.id === filter)
                        ?.labelKey ?? "studio:search.filter.everything",
                    ),
                }}
              />
            }
            action={{
              label: t("studio:search.empty.clearCta"),
              onClick: () => {
                setQuery("");
                setFilter("Everything");
              },
            }}
          />
        ) : (
          <div className={ss.rowGrid}>
            {results.map((result, resultIndex) => (
              <FadeIn
                key={result.pre + result.meta}
                delay={Math.min(resultIndex, 8) * 60}
              >
                <Link to={result.to} className={ss.card}>
                  <div className={ss.cardCov}>
                    <ImageSlot
                      src={result.image}
                      tint={result.tint}
                      width="100%"
                      height="100%"
                      radius={10}
                      placeholder={t("studio:media.coverLabel")}
                      style={{ position: "absolute", inset: 0 }}
                    />
                  </div>
                  <h4>
                    {result.pre}
                    {result.em && <em>{result.em}</em>}
                    {result.post}
                  </h4>
                  <div className={ss.meta}>{result.meta}</div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </StudioShell>
  );
}
