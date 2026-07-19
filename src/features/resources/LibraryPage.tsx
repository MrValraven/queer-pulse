import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  FilterChips,
  Outro,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { CATEGORIES, POPULAR } from "./library.data";
import { useLibraryData } from "./api/useLibraryData";
import res from "./resources.module.css";
import s from "./library.module.css";

function GuideSkeleton() {
  // Mirrors the real guide card: meta line, title, description, footer row.
  return (
    <div className={res.card}>
      <SkeletonLine width="40%" height={12} style={{ marginTop: 14 }} />
      <SkeletonLine width="80%" height={19} style={{ marginTop: 6 }} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 8 }} />
      <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
      <div className={res.cardFoot}>
        <SkeletonLine width="30%" height={13} />
        <SkeletonLine width="35%" height={13} />
      </div>
    </div>
  );
}

export function LibraryPage() {
  const { t } = useTranslation();
  const [cat, setCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const {
    guides,
    loading: dataLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLibraryData();
  const loading = useSimulatedLoad() || dataLoading;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchCat = cat === "all" || guide.cat === cat;
      const matchQuery =
        !q ||
        `${guide.title} ${guide.desc} ${guide.catLabel}`
          .toLowerCase()
          .includes(q);
      return matchCat && matchQuery;
    });
  }, [cat, query, guides]);

  return (
    <PageShell>
      <ResourceHero
        eyebrow={t("resources:library.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:library.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:library.hero.lead")}
        anchors={[
          {
            label: t("resources:library.hero.anchor.browseAll"),
            href: "#browse",
          },
          { label: t("resources:library.hero.anchor.legal"), href: "#browse" },
          { label: t("resources:library.hero.anchor.health"), href: "#browse" },
          {
            label: t("resources:library.hero.anchor.housing"),
            href: "#browse",
          },
        ]}
      />

      <section className={`${res.section} ${res.sectionPaper}`} id="browse">
        <div className="wrap">
          <Reveal className={s.toolbar}>
            <label className={s.search}>
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
                aria-label={t("resources:library.search.placeholder")}
                placeholder={t("resources:library.search.placeholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </Reveal>

          <Reveal as="div" delay={60}>
            <FilterChips
              className={s.chips}
              label={t("resources:library.filterAria")}
              options={CATEGORIES.map((category) => ({
                value: category.id,
                label: t(category.labelKey),
              }))}
              value={cat}
              onChange={setCat}
            />
          </Reveal>

          {loading ? (
            <div className={res.grid} aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <GuideSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className={s.empty}>{t("resources:library.empty")}</p>
          ) : (
            <div className={res.grid}>
              {results.map((guide, index) => (
                <FadeIn
                  key={guide.title}
                  className={res.card}
                  delay={Math.min(index, 8) * 60}
                >
                  <span className={s.resMeta}>{guide.catLabel}</span>
                  <div className={res.cardName} style={{ fontSize: 19 }}>
                    {guide.title}
                  </div>
                  <div className={res.cardSpec}>{guide.desc}</div>
                  <div className={res.cardFoot}>
                    <span className={res.cardLoc}>{guide.meta}</span>
                    <Link to={guide.to} className={res.cardCta}>
                      {t("resources:library.readGuideCta")}
                    </Link>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className={s.loadMore}>
              <Button
                type="button"
                variant="ghost"
                disabled={isFetchingNextPage}
                onClick={fetchNextPage}
              >
                {isFetchingNextPage
                  ? t("resources:library.loadingMore")
                  : t("resources:library.loadMoreCta")}
              </Button>
            </div>
          )}

          <Reveal className={s.popular} delay={120}>
            <span>{t("resources:library.popularLabel")}</span>
            {POPULAR.map((term) => (
              <button key={term} type="button" onClick={() => setQuery(term)}>
                {term}
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:library.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:library.outro.sub")}
      >
        <Button to={routes.forum} variant="primary" size="lg">
          {t("resources:library.outro.askCommunityCta")}
        </Button>
        <Button to={routes.contact} variant="ghost-dark" size="lg">
          {t("resources:library.outro.suggestGuideCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
