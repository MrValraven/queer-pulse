import { PageShell } from "../../shared/components/layout";
import { Reveal } from "../../shared/components/ui";
import {
  NEXT_ACTIONS,
  STATUS_CARDS,
  workIdentity,
  workStatusLine,
} from "./work.data";
import { WorkNextActions } from "./WorkNextActions";
import { WorkHubCards } from "./WorkHubCards";
import { WorkProfileCard } from "./WorkProfileCard";
import styles from "./WorkHubPage.module.css";

/** The logged-in "Your Work" home — the spine that ties the Work silos together. */
export function WorkHubPage() {
  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <Reveal as="div" className={styles.eyebrow}>
            Your workspace
          </Reveal>
          <Reveal as="h1" delay={60} className={styles.h1}>
            Your work, <em>{workIdentity.first}.</em>
          </Reveal>
          <Reveal as="p" delay={120} className={styles.status}>
            {workStatusLine}
          </Reveal>
        </header>

        <section className={styles.band}>
          <h2 className={styles.sectionTitle}>What needs you</h2>
          <WorkNextActions actions={NEXT_ACTIONS} />
        </section>

        <section className={styles.band}>
          <h2 className={styles.sectionTitle}>Where everything stands</h2>
          <WorkHubCards cards={STATUS_CARDS} />
        </section>

        <section className={styles.band}>
          <h2 className={styles.sectionTitle}>Your work profile</h2>
          <WorkProfileCard />
        </section>
      </div>
    </PageShell>
  );
}
