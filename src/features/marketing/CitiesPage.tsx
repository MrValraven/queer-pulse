import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad, useCountUp } from "../../shared/hooks";
import {
  GroundworkSection,
  HowSection,
  WaitlistSection,
} from "./CitiesSections";
import { CitiesLiveGrid } from "./CitiesLiveCards";
import styles from "./CitiesPage.module.css";

export function CitiesPage() {
  const { showToast } = useToast();
  const loading = useSimulatedLoad();

  // Count-up targets — Lisbon
  const lBonusCount = useCountUp(612, { active: !loading, durationMs: 1200 });
  const lGatherings = useCountUp(284, { active: !loading, durationMs: 1200 });
  const lSafeSpaces = useCountUp(42, { active: !loading, durationMs: 1200 });
  const lMagIssues = useCountUp(9, { active: !loading, durationMs: 1200 });

  // Count-up targets — Porto
  const pMembers = useCountUp(84, { active: !loading, durationMs: 1200 });
  const pGatherings = useCountUp(12, { active: !loading, durationMs: 1200 });
  const pSafeSpaces = useCountUp(7, { active: !loading, durationMs: 1200 });
  const pPartners = useCountUp(2, { active: !loading, durationMs: 1200 });

  const counts = {
    lBonusCount,
    lGatherings,
    lSafeSpaces,
    lMagIssues,
    pMembers,
    pGatherings,
    pSafeSpaces,
    pPartners,
  };

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            Cities · network footprint · selector
          </div>
          <h1 className={styles.h1}>
            One city at a <em>time.</em>
          </h1>
          <p className={styles.dek}>
            QueerPulse is rooted in Lisbon. We will only open in a new city when
            there is <b>at least one moderator in-country</b>, a partner
            organisation aligned, and a clear local need.{" "}
            <em>That makes expansion slow on purpose.</em> Below: where we are
            now, where we're building, and how you can pull us toward your city.
          </p>
          <div className={styles.current}>
            <div className={styles.currentIc}>
              <svg viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className={styles.currentText}>
              <b>You're browsing as</b>
              <span>Lisbon, Portugal</span>
            </div>
            <button
              type="button"
              className={styles.currentBtn}
              onClick={() =>
                showToast(
                  "Detected from IP. You can switch from any city card below.",
                  "info",
                )
              }
            >
              Change
            </button>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <section>
          <div className={styles.secH}>
            <h2>
              Live · <em>fully operational</em>
            </h2>
            <span className={styles.meta}>
              Active community, moderators, partner orgs
            </span>
          </div>
          <CitiesLiveGrid
            loading={loading}
            counts={counts}
            showToast={showToast}
          />
        </section>

        <GroundworkSection />
        <WaitlistSection />
      </div>

      <HowSection />
    </PageShell>
  );
}
