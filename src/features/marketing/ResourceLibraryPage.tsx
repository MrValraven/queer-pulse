import { useMemo, useState } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { LIBRARY_SUBPAGES, RESOURCES } from "./resourceLibrary.data";
import {
  ResourceCard,
  ResourceCardSkeleton,
  ResourceFilterBar,
} from "./ResourceLibrarySections";
import s from "./ResourceLibraryPage.module.css";

export function ResourceLibraryPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const pageTitle = t("marketing:resourceLibrary.meta.title");
  const pageDescription = t("marketing:resourceLibrary.meta.description");

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return RESOURCES.filter((resource) => {
      if (cat !== "all" && resource.cat !== cat) return false;
      if (
        normalizedQuery &&
        !(
          resource.name.toLowerCase().includes(normalizedQuery) ||
          resource.description.toLowerCase().includes(normalizedQuery) ||
          resource.tags.join(" ").toLowerCase().includes(normalizedQuery)
        )
      )
        return false;
      return true;
    });
  }, [cat, query]);

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
            <b>{RESOURCES.length}</b>
            <span>{t("marketing:resourceLibrary.stats.resources")}</span>
          </div>
          <div className={s.stat}>
            <b>7</b>
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
            {!loading && visible.length === 0 && (
              <div className={s.empty}>
                {t("marketing:resourceLibrary.empty")}
              </div>
            )}
            {!loading &&
              visible.map((resource, index) => (
                <ResourceCard
                  key={resource.name}
                  resource={resource}
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
        <Button
          size="lg"
          href="mailto:hello@queerpulse.pt?subject=Resource suggestion"
        >
          {t("marketing:resourceLibrary.outro.cta")}
        </Button>
      </Outro>

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
