import { Link } from "react-router-dom";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import { routes } from "../../app/routeMap";
import styles from "./VolunteerOpportunityPage.module.css";

const MEMBER = routes.members;

const Tick = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function VolunteerOpportunityMain({
  opp,
}: {
  opp: VolunteerOpportunity;
}) {
  return (
    <main>
      <section className={styles.sec}>
        <h2>
          Why this role <em>matters</em>
        </h2>
        {opp.why.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className={styles.sec}>
        <h2>
          What you'll <em>actually do</em>
        </h2>
        <div className={styles.tasks}>
          {opp.tasks.map((t) => (
            <div className={styles.taskRow} key={t.title}>
              <div className={styles.taskIc}>
                <Tick />
              </div>
              <div>
                <b>{t.title}</b>
                <span>{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          The <em>commitment</em>, honestly
        </h2>
        <div className={styles.commitGrid}>
          {opp.commitments.map((c) => (
            <div className={styles.commit} key={c.b}>
              <b>{c.b}</b>
              <span>{c.s}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          Who's <em>good for this</em>
        </h2>
        {opp.goodFor.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className={styles.sec}>
        <h2>
          Who's <em>already in</em>
        </h2>
        <p className={styles.teamIntro}>{opp.teamIntro}</p>
        <div className={styles.teamRow}>
          {opp.team.map((m) => (
            <Link to={MEMBER} className={styles.teamPill} key={m.name}>
              <div
                className={styles.av}
                style={{ background: m.bg, color: m.color }}
              >
                {m.initials}
              </div>
              {m.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
