import { useMemo } from "react";
import { FiBriefcase, FiEdit3 } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfileData } from "../../app/providers/useProfile";
import { routes } from "../../app/routeMap";
import {
  NEXT_ACTIONS,
  STATUS_CARDS,
  workStatusLine,
  applicationsHubCard,
  type StatusCard,
} from "./work.data";
import { useMyJobs } from "./api/jobOwner.hooks";
import { WorkNextActions } from "./WorkNextActions";
import { WorkHubCards } from "./WorkHubCards";
import { WorkProfileCard } from "./WorkProfileCard";
import styles from "./WorkHubPage.module.css";

/** The logged-in "Your Work" home — the spine that ties the Work silos together. */
export function WorkHubPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfileData();
  const statusLine = useMemo(() => workStatusLine(t), [t]);
  // PRD-44: the hub is the spine of Work, so a member who has published a role
  // gets the way into managing it here. The card is absent for everyone else
  // rather than showing a zero, which would read as a dead end.
  const { rows: myPostedJobs } = useMyJobs();
  const myJobsCard = useMemo<StatusCard>(
    () => ({
      key: "my-jobs",
      icon: <FiEdit3 />,
      labelKey: "economy:myJobs.hub.label",
      primaryKey: "economy:myJobs.hub.primary",
      primaryValues: { count: myPostedJobs.length },
      nextKey: "economy:myJobs.hub.next",
      to: routes.myJobs,
    }),
    [myPostedJobs.length],
  );
  // The activity summaries are demo-only fiction — live mode has no backend to
  // aggregate them yet, so it shows a neutral getting-started state.
  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <Reveal as="div" className={styles.eyebrow}>
            {t("economy:workHub.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60} className={styles.h1}>
            <Translation
              i18nKey="economy:workHub.title"
              values={{ name: profile.first }}
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" delay={120} className={styles.status}>
            {demoMode ? statusLine : t("economy:workHub.status.live")}
          </Reveal>
        </header>

        <section className={styles.band}>
          <h2 className={styles.sectionTitle}>
            {t("economy:workHub.card.apps.label")}
          </h2>
          <WorkHubCards cards={[applicationsHubCard(demoMode)]} />
        </section>

        {myPostedJobs.length > 0 && (
          <section className={styles.band}>
            <h2 className={styles.sectionTitle}>
              {t("economy:myJobs.hub.label")}
            </h2>
            <WorkHubCards cards={[myJobsCard]} />
          </section>
        )}

        {demoMode ? (
          <>
            <section className={styles.band}>
              <h2 className={styles.sectionTitle}>
                {t("economy:workHub.section.needsYou")}
              </h2>
              <WorkNextActions actions={NEXT_ACTIONS} />
            </section>

            <section className={styles.band}>
              <h2 className={styles.sectionTitle}>
                {t("economy:workHub.section.whereThingsStand")}
              </h2>
              <WorkHubCards cards={STATUS_CARDS} />
            </section>
          </>
        ) : (
          <section className={styles.band}>
            <EmptyState
              icon={<FiBriefcase />}
              title={t("economy:workHub.emptyLive.title")}
              description={t("economy:workHub.emptyLive.description")}
              action={{
                label: t("economy:workHub.emptyLive.cta"),
                to: routes.jobs,
              }}
            />
          </section>
        )}

        <section className={styles.band}>
          <h2 className={styles.sectionTitle}>
            {t("economy:workHub.section.profile")}
          </h2>
          <WorkProfileCard />
        </section>
      </div>
    </PageShell>
  );
}
