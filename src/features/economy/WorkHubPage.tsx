import { FiBriefcase } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, Reveal } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfile } from "../../app/providers/ProfileProvider";
import { routes } from "../../app/routeMap";
import { NEXT_ACTIONS, STATUS_CARDS, workStatusLine } from "./work.data";
import { WorkNextActions } from "./WorkNextActions";
import { WorkHubCards } from "./WorkHubCards";
import { WorkProfileCard } from "./WorkProfileCard";
import styles from "./WorkHubPage.module.css";

/** The logged-in "Your Work" home — the spine that ties the Work silos together. */
export function WorkHubPage() {
  const { demoMode } = useDemoMode();
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfile();
  // The activity summaries are demo-only fiction — live mode has no backend to
  // aggregate them yet, so it shows a neutral getting-started state.
  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <Reveal as="div" className={styles.eyebrow}>
            Your workspace
          </Reveal>
          <Reveal as="h1" delay={60} className={styles.h1}>
            Your work, <em>{profile.first}.</em>
          </Reveal>
          <Reveal as="p" delay={120} className={styles.status}>
            {demoMode
              ? workStatusLine
              : "Everything to do with your work, in one place."}
          </Reveal>
        </header>

        {demoMode ? (
          <>
            <section className={styles.band}>
              <h2 className={styles.sectionTitle}>What needs you</h2>
              <WorkNextActions actions={NEXT_ACTIONS} />
            </section>

            <section className={styles.band}>
              <h2 className={styles.sectionTitle}>Where everything stands</h2>
              <WorkHubCards cards={STATUS_CARDS} />
            </section>
          </>
        ) : (
          <section className={styles.band}>
            <EmptyState
              icon={<FiBriefcase />}
              title="Your workspace is ready when you are"
              description="Apply to a job, find a mentor, or save a role and it'll all come together here — applications, grants, skills, and reviews in one view."
              action={{ label: "Browse jobs", to: routes.jobs }}
            />
          </section>
        )}

        <section className={styles.band}>
          <h2 className={styles.sectionTitle}>Your work profile</h2>
          <WorkProfileCard />
        </section>
      </div>
    </PageShell>
  );
}
