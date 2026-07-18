import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  ImageSlot,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useWorkshop } from "./api/useWorkshop";
import {
  WorkshopAbout,
  WorkshopNeeds,
  WorkshopPastWork,
  WorkshopSessions,
} from "./WorkshopSections";
import { WorkshopSidebar } from "./WorkshopSidebar";
import styles from "./WorkshopPage.module.css";

export function WorkshopPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  // `id` is the workshop's slug — the backend's identifier (DTO departure 1).
  const { workshop, isLoading } = useWorkshop(id);

  // Don't flash "not found" at someone who deep-linked while the fetch is out.
  if (isLoading) {
    return (
      <PageShell>
        <div className={styles.page}>
          <SkeletonLine height={26} width="45%" />
          <SkeletonLine height={16} style={{ marginTop: 14 }} />
          <SkeletonLine
            height={220}
            style={{ marginTop: 20, borderRadius: 18 }}
          />
        </div>
      </PageShell>
    );
  }

  if (!workshop) {
    return (
      <PageShell>
        <div className={styles.page}>
          <EmptyState
            title={t("economy:workshopPage.notFound.title")}
            description={t("economy:workshopPage.notFound.description")}
            action={{
              label: t("economy:workshopPage.notFound.backCta"),
              to: routes.skills,
            }}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.skills} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("economy:workshopPage.backToSkills")}
        </Link>

        <header className={styles.head}>
          <div>
            <div className={styles.eyebrow}>
              <span>{workshop.format}</span>
              <span className={styles.sep}>·</span>
              <span className={styles.mode}>{workshop.mode}</span>
              {workshop.added && (
                <span className={styles.newBadge}>
                  {t("economy:workshopPage.newBadge")}
                </span>
              )}
            </div>
            <h1 className={styles.h1}>
              {workshop.title} <em>{workshop.titleEm}</em>
            </h1>
            <p className={styles.sub}>{workshop.blurb}</p>
          </div>
          <ImageSlot
            className={styles.heroImg}
            tint={workshop.heroTint}
            radius={18}
            placeholder={workshop.heroPlaceholder}
          />
        </header>

        <div className={styles.grid}>
          <main>
            <Reveal>
              <WorkshopAbout workshop={workshop} />
            </Reveal>
            <Reveal>
              <WorkshopSessions workshop={workshop} />
            </Reveal>
            <Reveal>
              <WorkshopNeeds workshop={workshop} />
            </Reveal>
            <Reveal>
              <WorkshopPastWork workshop={workshop} />
            </Reveal>
          </main>
          <WorkshopSidebar workshop={workshop} />
        </div>

        <div style={{ marginTop: 24 }}>
          <Button to={routes.skills} variant="ghost">
            {t("economy:workshopPage.footerBackCta")}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
