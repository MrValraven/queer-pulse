import { useMemo, useState } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { CATEGORIES } from "../resources/library.data";
import { useLibraryData } from "../resources/api/useLibraryData";
import { SuggestEditModal } from "../resources/SuggestEditModal";
import { SuggestEditTrigger } from "../resources/SuggestEditTrigger";
import { LIBRARY_SUBPAGES, ORGANISATIONS } from "./resourceLibrary.data";
import {
  GuideCard,
  OrganisationCard,
  ResourceCardSkeleton,
  ResourceFilterBar,
} from "./ResourceLibrarySections";
import s from "./ResourceLibraryPage.module.css";

// CNT-11: the canonical, nav-linked "/resources" surface — consolidated onto
// real backend-driven guide data (see useLibraryData) instead of the old
// static mock, so there is exactly one resource library with one taxonomy.
// The old resources-feature `LibraryPage` at "/resources/library" now
// redirects here (see resources/routes.tsx).
export function ResourceLibraryPage() {
  const { t } = useTranslation();
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  // PRD-272. The outro's "Suggest a resource" call used to be a
  // `mailto:hello@queerpulse.com?subject=Resource suggestion`, which walked
  // past the tracked intake this very page already offers a few hundred pixels
  // higher up (`SuggestEditTrigger`, `context: "library"`). Both now open the
  // same modal and land in the same queue, so a suggestion carries a status
  // and an in-app answer instead of disappearing into a shared mailbox.
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const {
    guides,
    loading: dataLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLibraryData();
  const loading = useSimulatedLoad() || dataLoading;
  const pageTitle = t("marketing:resourceLibrary.meta.title");
  const pageDescription = t("marketing:resourceLibrary.meta.description");

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return guides.filter((guide) => {
      if (cat !== "all" && guide.category !== cat) return false;
      if (
        normalizedQuery &&
        !`${guide.title} ${guide.description} ${guide.categoryLabel}`
          .toLowerCase()
          .includes(normalizedQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [cat, query, guides]);

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:resourceLibrary.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:resourceLibrary.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:resourceLibrary.hero.sub")}
      >
        <div className={s.stats}>
          <div className={s.stat}>
            <b>{loading ? "…" : guides.length}</b>
            <span>{t("marketing:resourceLibrary.stats.resources")}</span>
          </div>
          <div className={s.stat}>
            <b>{CATEGORIES.length - 1}</b>
            <span>{t("marketing:resourceLibrary.stats.categories")}</span>
          </div>
          <div className={s.stat}>
            <b>{t("marketing:resourceLibrary.stats.communityLabel")}</b>
            <span>{t("marketing:resourceLibrary.stats.maintained")}</span>
          </div>
        </div>
      </PageHero>

      <ResourceFilterBar
        query={query}
        onQuery={setQuery}
        cat={cat}
        onCat={setCat}
        resultCount={visible.length}
      />

      <section className={s.body}>
        <div className="wrap">
          <div className={s.grid}>
            {loading &&
              Array.from({ length: 9 }).map((_, index) => (
                <ResourceCardSkeleton key={index} />
              ))}
            {/* Two different emptinesses, and telling them apart matters: a
                filter that matches nothing is the reader's to fix, whereas a
                library holding nothing at all means no guide has passed
                editorial review yet, and "try a broader filter" would send
                someone hunting for a filter that would not help. */}
            {!loading && visible.length === 0 && (
              <div className={s.empty}>
                {guides.length === 0
                  ? t("marketing:resourceLibrary.emptyUnreviewed")
                  : t("marketing:resourceLibrary.empty")}
              </div>
            )}
            {!loading &&
              visible.map((guide, index) => (
                <GuideCard key={guide.title} guide={guide} index={index} />
              ))}
          </div>

          {!loading && hasNextPage && (
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

          {/* CON-10: the library grid only ever linked the guides whose
              cards it renders. This reaches the full index, including the
              guides that had no inbound link anywhere in the app. */}
          <div className={s.loadMore}>
            <Button to={routes.guideIndex} variant="ghost">
              {t("resources:guideIndex.linkCta")}
            </Button>
          </div>

          <SuggestEditTrigger
            subjectOptions={guides.map((guide) => guide.title)}
            context="library"
          />
        </div>
      </section>

      <section className={s.orgsSection}>
        <div className="wrap">
          <h2 className={s.orgsTitle}>
            <Translation
              i18nKey="marketing:resourceLibrary.orgs.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={s.orgsLead}>
            {t("marketing:resourceLibrary.orgs.lead")}
          </p>
          <div className={s.grid}>
            {ORGANISATIONS.map((organisation, index) => (
              <OrganisationCard
                key={organisation.name}
                organisation={organisation}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:resourceLibrary.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:resourceLibrary.outro.sub")}
      >
        <Button size="lg" type="button" onClick={() => setIsSuggestOpen(true)}>
          {t("marketing:resourceLibrary.outro.cta")}
        </Button>
      </Outro>

      {isSuggestOpen && (
        <SuggestEditModal
          subjectOptions={guides.map((guide) => guide.title)}
          context="library"
          onClose={() => setIsSuggestOpen(false)}
        />
      )}

      <SubpageIndex
        eyebrow={t("marketing:resourceLibrary.subpages.eyebrow")}
        title={t("marketing:resourceLibrary.subpages.title")}
        items={LIBRARY_SUBPAGES.map((subpage) => ({
          label: t(subpage.labelKey),
          to: subpage.to,
          blurb: t(subpage.blurbKey),
        }))}
      />
    </PageShell>
  );
}
