import { useMemo, useState } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { CATEGORIES } from "../resources/library.data";
import { useLibraryData } from "../resources/api/useLibraryData";
import { SuggestEditModal } from "../resources/SuggestEditModal";
import { LIBRARY_SUBPAGES, ORGANISATIONS } from "./resourceLibrary.data";
import { OrganisationCard, ResourceFilterBar } from "./ResourceLibrarySections";
import { ResourceLibraryGuides } from "./ResourceLibraryGuides";
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
    hasFailedWithoutData,
    isRetrying,
    refetch,
  } = useLibraryData();
  // A Retry of a failed first load puts the query back to pending; the error
  // panel stays mounted (so focus stays on its button) while it runs.
  const loading = (useSimulatedLoad() || dataLoading) && !hasFailedWithoutData;
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
            <b>{loading || hasFailedWithoutData ? "…" : guides.length}</b>
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
        resultCount={hasFailedWithoutData ? null : visible.length}
      />

      <section className={s.body}>
        <div className="wrap">
          <ResourceLibraryGuides
            guides={guides}
            visible={visible}
            loading={loading}
            hasFailedWithoutData={hasFailedWithoutData}
            isRetrying={isRetrying}
            onRetry={refetch}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onFetchNextPage={fetchNextPage}
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
