import { PageShell } from "../../shared/components/layout";
import {
  CinemaMembershipTiers,
  CinemaMembershipPays,
  CinemaMembershipLedger,
} from "./CinemaMembershipPays";
import styles from "./CinemaMembershipPage.module.css";

export function CinemaMembershipPage() {
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.eb}>
            <span className="live" /> QueerPulse Cinema · sustainer membership
          </div>
          <h1 className={styles.title}>
            The room <em>stays open</em> because you're in it.
          </h1>
          <p className={styles.sub}>
            Sustainers fund the films, the commissions, the captions, and the
            curators. In return: everything. No algorithm, no lock-in, no dark
            patterns. Cancel any time.
          </p>
        </div>
      </section>

      <CinemaMembershipTiers />
      <CinemaMembershipPays />
      <CinemaMembershipLedger />
    </PageShell>
  );
}
