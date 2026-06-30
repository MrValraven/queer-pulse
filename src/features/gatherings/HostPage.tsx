import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { HostSteps } from "./HostSteps";
import { HostSidebar } from "./HostSidebar";
import { HERO_TYPES } from "./hostPage.data";
import styles from "./HostPage.module.css";

export function HostPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>For members</div>
          <h1 className={styles.title}>
            Host a gathering <em>for your people.</em>
          </h1>
          <p className={styles.lede}>
            You don't need a venue budget, a committee, or a plan. You need a
            date, a few chairs, and something worth gathering for. This guide
            walks you through the rest.
          </p>
          <div className={styles.heroTypes}>
            {HERO_TYPES.map((type) => (
              <span key={type} className={styles.htype}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            <HostSteps />
            <HostSidebar />
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            The best gatherings are the ones <em>that happen.</em>
          </>
        }
        sub="Start small, start soon. The community is here."
      >
        <Button to={routes.createGathering} size="lg">
          Create your gathering →
        </Button>
      </Outro>
    </PageShell>
  );
}
