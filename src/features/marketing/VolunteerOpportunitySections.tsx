import { Link } from "react-router-dom";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import { Translation } from "../../shared/i18n/Translation";
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
          <Translation
            i18nKey="marketing:volunteerDetail.main.whyTitle"
            components={{ em: <em /> }}
          />
        </h2>
        {opp.why.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="marketing:volunteerDetail.main.tasksTitle"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.tasks}>
          {opp.tasks.map((task) => (
            <div className={styles.taskRow} key={task.title}>
              <div className={styles.taskIc}>
                <Tick />
              </div>
              <div>
                <b>{task.title}</b>
                <span>{task.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="marketing:volunteerDetail.main.commitmentTitle"
            components={{ em: <em /> }}
          />
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
          <Translation
            i18nKey="marketing:volunteerDetail.main.goodForTitle"
            components={{ em: <em /> }}
          />
        </h2>
        {opp.goodFor.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="marketing:volunteerDetail.main.teamTitle"
            components={{ em: <em /> }}
          />
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
