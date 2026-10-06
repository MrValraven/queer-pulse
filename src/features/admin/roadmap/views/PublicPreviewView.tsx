import { useMemo } from "react";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  AdminRoadmapIdeaDTO,
  AdminRoadmapItemDTO,
  RoadmapColumn,
} from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/itemDrawerHook";
import { PublicPreviewCard } from "./PublicPreviewCard";
import { PublicPreviewNotBuildingRow } from "./PublicPreviewNotBuildingRow";
import styles from "./PublicPreviewView.module.css";

interface SectionDef {
  column: RoadmapColumn;
  headingKey: string;
  subKey: string;
}

const SECTIONS: SectionDef[] = [
  {
    column: "building",
    headingKey: "admin:roadmap.publicPreview.buildingHeading",
    subKey: "admin:roadmap.publicPreview.buildingSub",
  },
  {
    column: "planned",
    headingKey: "admin:roadmap.publicPreview.nextUpHeading",
    subKey: "admin:roadmap.publicPreview.nextUpSub",
  },
  {
    column: "backlog",
    headingKey: "admin:roadmap.publicPreview.somedayHeading",
    subKey: "admin:roadmap.publicPreview.somedaySub",
  },
  {
    column: "shipped",
    headingKey: "admin:roadmap.publicPreview.shippedHeading",
    subKey: "admin:roadmap.publicPreview.shippedSub",
  },
];

const COLUMN_TILES = [
  { kind: "building", column: "building" },
  { kind: "planned", column: "planned" },
] as const;

/** The same three counts the server derives for the public hero. */
function computePreviewHeroStats(items: AdminRoadmapItemDTO[]) {
  const year = String(new Date().getFullYear());
  return [
    {
      kind: "shipped" as const,
      count: items.filter(
        (item) => item.column === "shipped" && (item.date ?? "").includes(year),
      ).length,
    },
    ...COLUMN_TILES.map(({ kind, column }) => ({
      kind,
      count: items.filter((item) => item.column === column).length,
    })),
  ];
}

/**
 * Renders `/roadmap` exactly as members would see it, from live admin data.
 * Hover (or focus) any card to edit it inline via the shared item
 * drawer. `items`/`ideas` both arrive via prop (this view's contract, per
 * plan Task C8); the hero-stat tiles it previews are counted from those
 * same items, as the public page's server does.
 *
 * "Not building this, and why" mirrors `NotBuildingView.tsx`'s own read of
 * declined ideas (`status === 'dismissed' && declineReason`), but read-only.
 * This is a *preview* of what members see rather than the admin tool, so
 * there's no reopen action here.
 */
export function PublicPreviewView({
  items,
  ideas,
}: {
  items: AdminRoadmapItemDTO[];
  ideas: AdminRoadmapIdeaDTO[];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const itemDrawer = useItemDrawer();

  const visibleItems = useMemo(
    () => items.filter((item) => item.isPublic && !item.archived),
    [items],
  );
  const heroStats = useMemo(
    () => computePreviewHeroStats(visibleItems),
    [visibleItems],
  );
  const hiddenCount = items.length - visibleItems.length;
  const committedCount = visibleItems.filter((item) => item.committed).length;
  const notBuildingIdeas = useMemo(
    () =>
      ideas
        .filter((idea) => idea.status === "dismissed" && idea.declineReason)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ideas],
  );

  return (
    <div className={styles.view}>
      <p className={styles.banner}>
        {t("admin:roadmap.publicPreview.banner", {
          count: hiddenCount,
          hidden: hiddenCount,
          promises: committedCount,
        })}
      </p>

      <div className={styles.heroPanel}>
        <div className={styles.heroGrid}>
          {heroStats.map((stat) => (
            <div
              key={stat.kind}
              className={[
                styles.heroTile,
                stat.kind === "shipped" && styles.heroTileJade,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <p className={styles.heroValue}>{fmt.number(stat.count)}</p>
              <p className={styles.heroLabel}>
                {t(`marketing:roadmap.hero.stat.${stat.kind}`, {
                  count: stat.count,
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {SECTIONS.map((section) => {
        const sectionItems = visibleItems.filter(
          (item) => item.column === section.column,
        );
        return (
          <section key={section.column} className={styles.section}>
            <h2 className={styles.sectionHeading}>{t(section.headingKey)}</h2>
            <p className={styles.sectionSub}>{t(section.subKey)}</p>
            {sectionItems.length === 0 ? (
              <p className={styles.emptySection}>
                {t("admin:roadmap.board.emptyColumn")}
              </p>
            ) : (
              <div className={styles.cardGrid}>
                {sectionItems.map((item) => (
                  <PublicPreviewCard
                    key={item.id}
                    item={item}
                    onEdit={() => itemDrawer.open(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          {t("admin:roadmap.publicPreview.notBuildingHeading")}
        </h2>
        <p className={styles.sectionSub}>
          {t("admin:roadmap.publicPreview.notBuildingSub")}
        </p>
        {notBuildingIdeas.length === 0 ? (
          <p className={styles.emptySection}>
            {t("admin:roadmap.board.emptyColumn")}
          </p>
        ) : (
          <ul className={styles.notBuildingList}>
            {notBuildingIdeas.map((idea) => (
              <PublicPreviewNotBuildingRow key={idea.id} idea={idea} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
