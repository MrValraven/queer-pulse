import { FiCheck, FiX, FiClock } from "react-icons/fi";
import {
  type AssemblyMinutes,
  type MinutesResolution,
} from "./assemblyMinutes.data";
import styles from "./AssemblyMinutesPage.module.css";

function OutcomeTag({ outcome }: { outcome: MinutesResolution["outcome"] }) {
  const cls =
    outcome === "Passed"
      ? styles.passed
      : outcome === "Rejected"
        ? styles.rejected
        : styles.tabled;
  const Icon =
    outcome === "Passed" ? FiCheck : outcome === "Rejected" ? FiX : FiClock;
  return (
    <span className={`${styles.outcome} ${cls}`}>
      <Icon aria-hidden /> {outcome}
    </span>
  );
}

export function AssemblyMinutesBody({ minutes }: { minutes: AssemblyMinutes }) {
  return (
    <div className={styles.body}>
      <section className={styles.metaCard}>
        <div className={styles.metaGrid}>
          <div>
            <span className={styles.metaLabel}>Date</span>
            <b>{minutes.date}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>Location</span>
            <b>{minutes.location}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>Chair</span>
            <b>{minutes.chair}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>Secretary</span>
            <b>{minutes.secretary}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>Quorum</span>
            <b>{minutes.quorum}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>Attendance</span>
            <b>
              {minutes.attendeesInPerson} in person · {minutes.attendeesOnline}{" "}
              online · {minutes.votesCast} votes
            </b>
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          Summary of <em>proceedings</em>
        </h2>
        <p className={styles.summary}>{minutes.summary}</p>
      </section>

      <section className={styles.sec}>
        <h2>
          <em>Agenda</em> as taken
        </h2>
        <div className={styles.agenda}>
          {minutes.agenda.map((a, i) => (
            <div className={styles.agRow} key={i}>
              <div className={styles.agTime}>{a.time}</div>
              <div className={styles.agInfo}>
                <b>{a.title}</b>
                <span>{a.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          Resolutions &amp; <em>outcomes</em>
        </h2>
        <div className={styles.resTable}>
          {minutes.resolutions.map((r) => (
            <div className={styles.resRow} key={r.ref}>
              <span className={styles.resRef}>{r.ref}</span>
              <div className={styles.resInfo}>
                <b>{r.title}</b>
                <span>{r.tally}</span>
              </div>
              <OutcomeTag outcome={r.outcome} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          Actions &amp; <em>next steps</em>
        </h2>
        <ul className={styles.actions}>
          {minutes.actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      <div className={styles.signoff}>
        Minutes recorded by {minutes.secretary} · ratified at the close of the{" "}
        {minutes.year} Annual Assembly. This is the public record.
      </div>
    </div>
  );
}
