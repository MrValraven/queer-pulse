import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiClock } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  LoadErrorState,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { formatDate } from "../../shared/lib/date";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { useGuideIndex } from "./api/useGuideIndex";
import type { ResourceIndexEntryDTO } from "./api/resources.api";
import {
  GUIDE_INDEX_CATEGORY_ORDER,
  isKnownGuideCategory,
} from "./library.data";
import { ResourceHero } from "./ResourceHero";
import styles from "./GuideIndexPage.module.css";

interface CategoryGroup {
  category: string;
  entries: ResourceIndexEntryDTO[];
}

/**
 * Every guide, in one category-grouped list (CON-10).
 *
 * Seventeen guides had no `routes.*` reference anywhere in the app. Their
 * only inbound links were hardcoded path strings inside a demo-only fixture
 * registry, and the library grid linked about eight of the ~31 through a
 * title-to-route lookup that fell back to the library whenever a title
 * stopped matching. So real, shipped work was reachable only by typing the
 * URL, and the guides worst affected served the least-served audiences:
 * disabled members, parents, QTIPOC, older members.
 *
 * This page links all of them, from the library and the resources meganav.
 */
export function GuideIndexPage() {
  const { t } = useTranslation();
  const { entries, isLoading, isError, refetch } = useGuideIndex();
  const pageTitle = t("resources:guideIndex.meta.title");
  const pageDescription = t("resources:guideIndex.meta.description");

  const groups = useMemo<CategoryGroup[]>(() => {
    const byCategory = new Map<string, ResourceIndexEntryDTO[]>();
    for (const entry of entries) {
      const bucket = byCategory.get(entry.category);
      if (bucket) bucket.push(entry);
      else byCategory.set(entry.category, [entry]);
    }
    // Curated order first, then anything the backend has grown since —
    // a new category must never fall off the index just because this file
    // has not caught up with it.
    const orderedKeys = [
      ...GUIDE_INDEX_CATEGORY_ORDER.filter((key) => byCategory.has(key)),
      ...[...byCategory.keys()]
        .filter(
          (key) =>
            !(GUIDE_INDEX_CATEGORY_ORDER as readonly string[]).includes(key),
        )
        .sort((left, right) => left.localeCompare(right)),
    ];
    return orderedKeys.map((category) => ({
      category,
      entries: (byCategory.get(category) ?? []).sort((left, right) =>
        left.title.localeCompare(right.title),
      ),
    }));
  }, [entries]);

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/guides" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:guideIndex.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:guideIndex.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:guideIndex.hero.lead")}
      />

      <section className={styles.body}>
        <div className="wrap">
          {isLoading && (
            <div className={styles.skeletons}>
              {[0, 1, 2, 3, 4, 5].map((skeletonIndex) => (
                <SkeletonLine
                  key={skeletonIndex}
                  height={62}
                  style={{ borderRadius: 14 }}
                />
              ))}
            </div>
          )}

          {/* The editorial gate and a failed request both end up with zero
              groups, and they mean opposite things. "No guide has been
              reviewed yet" is a true, deliberate state of this index, so it
              stays exactly as it was, and only a real request failure is
              allowed to replace it. */}
          {!isLoading && isError && groups.length === 0 && (
            <LoadErrorState
              onRetry={refetch}
              title={
                <Translation
                  i18nKey="resources:guideIndex.loadError.title"
                  components={{ em: <em /> }}
                />
              }
              description={t("resources:guideIndex.loadError.body")}
            />
          )}

          {!isLoading && !isError && groups.length === 0 && (
            <p className={styles.empty}>{t("resources:guideIndex.empty")}</p>
          )}

          {!isLoading &&
            groups.map((group) => (
              <div key={group.category} className={styles.group}>
                <Reveal as="h2" className={styles.groupTitle}>
                  {isKnownGuideCategory(group.category)
                    ? t(`resources:library.category.${group.category}`)
                    : group.category}
                </Reveal>
                <div className={styles.grid}>
                  {group.entries.map((entry, entryIndex) => (
                    <GuideIndexCard
                      key={entry.slug}
                      entry={entry}
                      index={entryIndex}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>
    </PageShell>
  );
}

function GuideIndexCard({
  entry,
  index,
}: {
  entry: ResourceIndexEntryDTO;
  index: number;
}) {
  const { t } = useTranslation();
  // A guide with no curated route still gets a real destination: its own
  // slug-addressable page. Nothing in this index links to nowhere.
  const to = entry.routePath ?? `${routes.resourceGuide}/${entry.slug}`;

  return (
    <Reveal delay={index * 40}>
      <Link to={to} className={styles.card}>
        <div className={styles.cardTitle}>{entry.title}</div>
        <div className={styles.cardDesc}>{entry.description}</div>
        <div className={styles.cardFoot}>
          {/* The "not reviewed yet" branch reads as dead code in live mode and
              is not: the backend only serves reviewed guides now, but the demo
              manifest carries `lastReviewedOn: null` on every entry, so demo
              still renders it. Deleting it would blank the chip in demo. */}
          <span className={styles.reviewed}>
            {entry.lastReviewedOn ? (
              <>
                <FiCheckCircle aria-hidden />
                {t("resources:guideIndex.card.reviewedOn", {
                  date: formatDate(entry.lastReviewedOn),
                })}
              </>
            ) : (
              <>
                <FiClock aria-hidden />
                {t("resources:guideIndex.card.notReviewed")}
              </>
            )}
          </span>
          <FiArrowRight aria-hidden className={styles.cardArrow} />
        </div>
      </Link>
    </Reveal>
  );
}
