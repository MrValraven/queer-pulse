import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
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
  TYPE_BADGE_KEYS,
  type ChangelogCategory,
} from "./changelog.data";
import styles from "./ChangelogPage.module.css";

function EntrySkeleton() {
  // Mirrors a real .entry row: 120px date column + title/body block.
  return (
    <div className={styles.entry} aria-hidden>
      <SkeletonLine width={90} height={13} style={{ marginTop: 3 }} />
      <div>
        <div className={styles.entryHead}>
          <SkeletonLine width={72} height={18} style={{ borderRadius: 6 }} />
          <SkeletonLine width="50%" height={16} />
        </div>
        <SkeletonLine width="100%" height={14.5} style={{ marginTop: 8 }} />
        <SkeletonLine width="92%" height={14.5} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

export function ChangelogPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState<ChangelogCategory | "all">("all");

  return (
    <PageShell>
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

          <FilterChips
            className={styles.filter}
            label={t("marketing:changelog.filterAria")}
            options={FILTERS.map((f) => ({
              value: f.id,
              label: t(f.labelKey),
            }))}
            value={filter}
            onChange={(value) => setFilter(value as ChangelogCategory | "all")}
          />

          {loading ? (
            <div className={styles.yearBlock}>
              <div className={styles.year} aria-hidden>
                <SkeletonLine width={120} height={32} />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <EntrySkeleton key={i} />
              ))}
            </div>
          ) : CHANGELOG_DATA.every((yearBlock) =>
              yearBlock.entries.every(
                (entry) => filter !== "all" && entry.category !== filter,
              ),
            ) ? (
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
            (() => {
              let row = 0;
              return CHANGELOG_DATA.map((yearBlock) => {
                const entries = yearBlock.entries.filter(
                  (entry) => filter === "all" || entry.category === filter,
                );
                if (entries.length === 0) return null;
                return (
                  <div className={styles.yearBlock} key={yearBlock.year}>
                    <div className={styles.year}>
                      <em>{yearBlock.year}</em>
                    </div>
                    {entries.map((entry) => (
                      <FadeIn
                        className={styles.entry}
                        key={entry.id}
                        delay={Math.min(row++, 8) * 60}
                      >
                        <div className={styles.date}>{entry.date}</div>
                        <div>
                          <div className={styles.entryHead}>
                            <span
                              className={`${styles.badge} ${styles[entry.category]}`}
                            >
                              {t(TYPE_BADGE_KEYS[entry.category])}
                            </span>
                            <div className={styles.entryTitle}>
                              {t(entry.titleKey)}
                            </div>
                          </div>
                          <div className={styles.entryBody}>
                            <p>{t(entry.bodyKey)}</p>
                          </div>
                          {entry.tag && (
                            <Link className={styles.tag} to={entry.tag.to}>
                              {t(entry.tag.labelKey)}
                            </Link>
                          )}
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>
    </PageShell>
  );
}
