import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  ImageSlot,
  Reveal,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useWorkshops } from "../../app/providers/WorkshopsProvider";
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
  const { getWorkshop } = useWorkshops();
  const workshop = id ? getWorkshop(id) : undefined;

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
