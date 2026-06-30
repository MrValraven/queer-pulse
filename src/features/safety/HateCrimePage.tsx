import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { HateCrimePanel } from "./HateCrimeTabs";
import styles from "./HateCrimePage.module.css";

const LEGAL = routes.legal;

export function HateCrimePage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Reporting guide · Portugal</div>
          <h1 className={styles.title}>
            How to report
            <br />
            <em>a hate crime.</em>
          </h1>
          <p className={styles.sub}>
            Step-by-step — from the moment it happens to formal reporting,
            community support, and legal follow-up. Most people don't report
            because they don't know how. This guide removes that barrier.
          </p>
          <div className={styles.important}>
            <p>
              <strong>Your safety comes first.</strong> If you are in immediate
              danger, call <strong>112</strong> now. This guide is for after you
              are safe.
            </p>
          </div>
        </div>
      </header>

      <HateCrimePanel />

      <Outro
        title={
          <>
            You have <em>rights.</em>
          </>
        }
        sub="The QueerPulse community includes lawyers, legal professionals, and people who have been through this process. You do not have to navigate it alone."
      >
        <Button to={LEGAL} variant="primary" size="lg">
          Legal resources
        </Button>
      </Outro>
    </PageShell>
  );
}
