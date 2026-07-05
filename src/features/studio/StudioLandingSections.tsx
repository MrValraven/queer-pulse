import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useScrollReveal, useCountUp } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import {
  PROMISES,
  PAYOUT_TOTAL,
  COUNTER_STATS,
  COMPARE,
} from "./studioLanding.data";
import styles from "./StudioLandingPage.module.css";

export function StudioLandingPromises() {
  return (
    <section className={styles.promises} id="how">
      <div className={styles.promisesH}>
        <div className={styles.ebPlain}>The contract · not the marketing</div>
        <h2>
          Four <em>promises</em> we make, to artists and listeners.
        </h2>
      </div>
      <div className={styles.grid4}>
        {PROMISES.map((p) => (
          <div key={p.num} className={styles.promise}>
            <div className={styles.num}>{p.num}</div>
            <h3>
              {p.titlePre}
              <em>{p.titleEm}</em>
              {p.titlePost}
            </h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StudioLandingCounter() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const total = useCountUp(PAYOUT_TOTAL, { active: isVisible });

  return (
    <section className={styles.counter} id="artists">
      <div className={styles.counterInner} ref={ref}>
        <div className={styles.counterEb}>
          <span className={styles.liveJade} />
          Live — updated as it happens
        </div>
        <h2>
          Since the open beta opened, <em>QueerPulse Studio</em> has paid out:
        </h2>
        <div className={styles.bigN}>
          €<em>{total.toLocaleString("en-US")}</em>
        </div>
        <p className={styles.counterSub}>
          to 2,138 artists, in five monthly cycles.
          <Link to={routes.governance}>See the ledger →</Link>
        </p>

        <div className={styles.counterStats}>
          {COUNTER_STATS.map((s) => (
            <div key={s.label} className={styles.cs}>
              <div className={styles.v}>
                <em>
                  {(s.prefix ?? "") +
                    s.value.toLocaleString("en-US") +
                    (s.suffix ?? "")}
                </em>
              </div>
              <div className={styles.l}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudioLandingComparison() {
  return (
    <section className={styles.compareBand}>
      <div className={styles.compareInner}>
        <div className={styles.compareH}>
          <h2>
            The <em>per-listen rate</em>, by comparison.
          </h2>
        </div>
        <div className={styles.compareGrid}>
          {COMPARE.map((c) => (
            <div
              key={c.label}
              className={`${styles.cmp} ${c.us ? styles.cmpUs : ""}`}
            >
              <div className={styles.lbl}>{c.label}</div>
              <div className={styles.v}>
                <em>{c.value}</em>
              </div>
              <div className={styles.ctx}>{c.ctx}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudioLandingCta() {
  return (
    <section className={styles.ctaBand}>
      <h2>
        Take a <em>seat</em> in the room.
      </h2>
      <p>
        €7 a month. Cancel any time. <em>The first listen</em> tells you whether
        the room is for you.
      </p>
      <div className={styles.ctaActions}>
        <Button variant="primary" size="lg" to={routes.sustainer}>
          Sustain · €7/mo
        </Button>
        <Button variant="ghost-dark" size="lg" to={routes.studioAbout}>
          Read the plan first
        </Button>
      </div>
      <div className={styles.ctaSecondary}>
        Already a QueerPulse member? Studio is <em>€4/mo on top</em>.{" "}
        <Link to={routes.signIn}>Sign in to add it →</Link>
      </div>
    </section>
  );
}
