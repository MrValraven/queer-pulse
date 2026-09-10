import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { FiClock } from "react-icons/fi";
import {
  EmptyState,
  FadeIn,
  FilterChips,
  HubBackLink,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  CHANGELOG_DATA,
  FILTERS,
  type ChangelogCategory,
} from "./changelog.data";
import { buildReleases, filterRelease } from "./changelogReleases";
import { ChangelogReleaseSection } from "./ChangelogReleaseSection";
import styles from "./ChangelogPage.module.css";

function ReleaseSkeleton() {
  // Mirrors a collapsed release: version column, date + headline, two counts.
  return (
    <div className={`${styles.release} ${styles.releaseSkeleton}`} aria-hidden>
      <SkeletonLine width={64} height={18} />
      <div className={styles.releaseMeta}>
        <SkeletonLine width={90} height={13} />
        <SkeletonLine width="70%" height={18} style={{ marginTop: 6 }} />
        <SkeletonLine width="40%" height={14} style={{ marginTop: 10 }} />
      </div>
    </div>
  );
}

const yearOf = (date: string) => date.slice(-4);

export function ChangelogPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState<ChangelogCategory | "all">("all");
  const releases = useMemo(
    () => buildReleases(CHANGELOG_DATA.flatMap((year) => year.entries)),
    [],
  );
  const [openDates, setOpenDates] = useState<ReadonlySet<string>>(
    () => new Set(releases.slice(0, 1).map((release) => release.date)),
  );

  const visibleReleases = releases
    .map((release) => filterRelease(release, filter))
    .filter((release) => release !== null);
  const isEverythingOpen =
    visibleReleases.length > 0 &&
    visibleReleases.every((release) => openDates.has(release.date));

  const toggleRelease = (date: string) =>
    setOpenDates((previous) => {
      const next = new Set(previous);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  const toggleEverything = () =>
    setOpenDates(
      isEverythingOpen
        ? new Set()
        : new Set(visibleReleases.map((release) => release.date)),
    );

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:changelog.meta.title")}
        description={t("marketing:changelog.meta.description")}
        canonical={routes.changelog}
      />
      <div className={styles.page}>
        <div className={`wrap ${styles.wrap}`}>
          <HubBackLink
            to={routes.roadmap}
            label={t("marketing:changelog.hero.backLabel")}
          />
          <div className={styles.header}>
            <div className={styles.eye}>
              {t("marketing:changelog.hero.eyebrow")}
            </div>
            <h1 className={styles.title}>
              <Translation
                i18nKey="marketing:changelog.hero.title"
                components={{ em: <em /> }}
              />
              <br />
              {t("marketing:changelog.hero.titleLine2")}
            </h1>
            <p className={styles.sub}>{t("marketing:changelog.hero.sub")}</p>
          </div>

          <div className={styles.toolbar}>
            <FilterChips
              className={styles.filter}
              label={t("marketing:changelog.filterAria")}
              options={FILTERS.map((option) => ({
                value: option.id,
                label: t(option.labelKey),
              }))}
              value={filter}
              onChange={(value) =>
                setFilter(value as ChangelogCategory | "all")
              }
            />
            {!loading && visibleReleases.length > 0 && (
              <button
                type="button"
                className={styles.toggleAll}
                onClick={toggleEverything}
              >
                {isEverythingOpen
                  ? t("marketing:changelog.controls.collapseAll")
                  : t("marketing:changelog.controls.expandAll")}
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.yearBlock}>
              <div className={styles.year} aria-hidden>
                <SkeletonLine width={120} height={32} />
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <ReleaseSkeleton key={index} />
              ))}
            </div>
          ) : visibleReleases.length === 0 ? (
            <EmptyState
              icon={<FiClock />}
              title={t("marketing:changelog.empty.title")}
              description={t("marketing:changelog.empty.description")}
              action={{
                label: t("marketing:changelog.empty.clearCta"),
                onClick: () => setFilter("all"),
              }}
            />
          ) : (
            visibleReleases.map((release, index) => {
              const previousRelease = visibleReleases[index - 1];
              const isFirstOfYear =
                !previousRelease ||
                yearOf(previousRelease.date) !== yearOf(release.date);
              return (
                <FadeIn key={release.date} delay={Math.min(index, 6) * 50}>
                  {isFirstOfYear && (
                    <h2 className={styles.year}>
                      <em>{yearOf(release.date)}</em>
                    </h2>
                  )}
                  <ChangelogReleaseSection
                    release={release}
                    isOpen={openDates.has(release.date)}
                    onToggle={() => toggleRelease(release.date)}
                  />
                </FadeIn>
              );
            })
          )}
        </div>
      </div>
    </PageShell>
  );
}
