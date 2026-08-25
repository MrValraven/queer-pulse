import { useMemo } from "react";
import { FiRss } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  AdminRoadmapIdeaDTO,
  AdminRoadmapItemDTO,
  RoadmapColumn,
} from "../../api/roadmapAdmin.types";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { AdminNotSet } from "../../ui/AdminInlineMarkers";
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

/**
 * Renders `/roadmap` exactly as members would see it, from live admin data.
 * Hover (or focus) any card to edit it inline via the shared item
 * drawer. `items`/`ideas` both arrive via prop (this view's contract, per
 * plan Task C8); the hero-stat tiles it also needs to preview come from
 * calling `useAdminRoadmap()` directly for `heroStats`; that hook reads
 * the same cached bundle the page already fetched, so this costs no extra
 * request.
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
  const { heroStats } = useAdminRoadmap();
  const itemDrawer = useItemDrawer();

  const visibleItems = useMemo(
    () => items.filter((item) => item.isPublic && !item.archived),
    [items],
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
              key={stat.label}
              className={[styles.heroTile, stat.jade && styles.heroTileJade]
                .filter(Boolean)
                .join(" ")}
            >
              <p className={styles.heroValue}>
                {stat.value || <AdminNotSet />}
              </p>
              <p className={styles.heroLabel}>{stat.label}</p>
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

      <div className={styles.subscribeStrip}>
        <div>
          <h2 className={styles.subscribeHeading}>
            {t("admin:roadmap.publicPreview.subscribeHeading")}
          </h2>
          <p className={styles.subscribeBody}>
            {t("admin:roadmap.publicPreview.subscribeBody")}
          </p>
        </div>
        {/* Visual only, per plan Task C8: a real subscribe form belongs to
            the public page (Phase D), not this admin preview, so the
            control stays disabled rather than pretending to submit. */}
        <form
          className={styles.subscribeForm}
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="email"
            disabled
            aria-label={t(
              "admin:roadmap.publicPreview.subscribeEmailPlaceholder",
            )}
            placeholder={t(
              "admin:roadmap.publicPreview.subscribeEmailPlaceholder",
            )}
            className={styles.subscribeInput}
          />
          <Button type="submit" disabled className={styles.subscribeButton}>
            {t("admin:roadmap.publicPreview.subscribeCta")}
          </Button>
          <Button variant="ghost" disabled className={styles.rssButton}>
            <FiRss aria-hidden /> {t("admin:roadmap.publicPreview.rssCta")}
          </Button>
        </form>
      </div>
    </div>
  );
}
