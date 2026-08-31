import { FiCheck, FiTrendingUp } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  FadeIn,
  LoadErrorState,
  SkeletonCard,
  SubpageIndex,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { useRoadmap } from "./api/useRoadmap";
import { BuildingCard, PlannedCard, ShippedCard } from "./RoadmapCards";
import {
  HowWeDecide,
  NotBuildingSection,
  SomedaySection,
  SubmitIdea,
  TopIdeas,
} from "./RoadmapSections";
import styles from "./RoadmapPage.module.css";

export function RoadmapPage() {
  const { t } = useTranslation();
  const {
    heroStats,
    shipped,
    building,
    planned,
    backlog,
    topIdeas,
    notBuilding,
    loading,
    isError,
    refetch,
  } = useRoadmap();
  const pageTitle = t("marketing:roadmap.meta.title");
  const pageDescription = t("marketing:roadmap.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.roadmap },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:roadmap.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:roadmap.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:roadmap.hero.sub")}
      >
        <div className={styles.heroStats}>
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className={`${styles.statTile} ${stat.jade ? styles.jade : ""}`}
            >
              {stat.value && (
                <div className={styles.statValue}>{stat.value}</div>
              )}
              <div className={styles.statLabel}>{stat.label}</div>
              {stat.note && <div className={styles.statNote}>{stat.note}</div>}
            </div>
          ))}
        </div>
      </PageHero>

      <div className={styles.body}>
        <div className="wrap">
          {/* DES-22: a failed read would otherwise draw three empty columns,
              which says nothing is shipped, being built, or planned. */}
          {isError && <LoadErrorState onRetry={refetch} />}
          {!isError && (
            <div className={styles.kanban}>
              <section className={styles.col}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colChip} ${styles.shipped}`}>
                    <FiCheck aria-hidden /> {t("marketing:roadmap.col.done")}
                  </span>
                </div>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  : shipped.map((item, i) => (
                      <FadeIn key={item.id} delay={i * 60}>
                        <ShippedCard item={item} />
                      </FadeIn>
                    ))}
              </section>

              <section className={styles.col}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colChip} ${styles.building}`}>
                    <span className={styles.pulseDot} aria-hidden />{" "}
                    {t("marketing:roadmap.col.buildingNow")}
                  </span>
                </div>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  : building.map((item, i) => (
                      <FadeIn key={item.id} delay={i * 60}>
                        <BuildingCard item={item} />
                      </FadeIn>
                    ))}
              </section>

              <section className={styles.col}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colChip} ${styles.planned}`}>
                    <FiTrendingUp aria-hidden />{" "}
                    {t("marketing:roadmap.col.planned")}
                  </span>
                </div>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  : planned.map((item, i) => (
                      <FadeIn key={item.id} delay={i * 60}>
                        <PlannedCard item={item} />
                      </FadeIn>
                    ))}
              </section>
            </div>
          )}

          {!loading && !isError && <SomedaySection items={backlog} />}

          <section className={styles.shapeSection}>
            <h2 className={styles.sectionHead}>
              <Translation
                i18nKey="marketing:roadmap.shape.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.sectionSub}>
              {t("marketing:roadmap.shape.sub")}
            </p>
            <div className={styles.shapeGrid}>
              <SubmitIdea />
              <TopIdeas ideas={topIdeas} />
            </div>
          </section>

          <HowWeDecide />

          {!loading && !isError && <NotBuildingSection items={notBuilding} />}
        </div>
      </div>

      <SubpageIndex
        title={t("marketing:roadmap.subpageIndex.title")}
        items={[
          {
            label: t("marketing:roadmap.subpageIndex.changelog.label"),
            to: routes.changelog,
            blurb: t("marketing:roadmap.subpageIndex.changelog.blurb"),
          },
        ]}
      />
    </PageShell>
  );
}
