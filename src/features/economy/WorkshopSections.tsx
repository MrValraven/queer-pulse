import { ImageSlot } from "../../shared/components/ui";
import type { Workshop } from "./workshops.data";
import styles from "./WorkshopPage.module.css";

/** "What you'll actually do" — the intro prose. */
export function WorkshopAbout({ workshop }: { workshop: Workshop }) {
  return (
    <section className={styles.sec}>
      <h2>
        What you'll <em>actually do</em>
      </h2>
      {workshop.about.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </section>
  );
}

/** The session-by-session plan. */
export function WorkshopSessions({ workshop }: { workshop: Workshop }) {
  return (
    <section className={styles.sec}>
      <h2>
        The <em>{workshop.sessions.length} sessions</em>
      </h2>
      <div className={styles.sessTable}>
        {workshop.sessions.map((s) => (
          <div
            key={s.n}
            className={[styles.sessRow, s.done && styles.done]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.sessN}>
              {s.n.slice(0, -1)}
              <em>{s.n.slice(-1)}</em>
            </div>
            <div className={styles.sessInfo}>
              <b>{s.title}</b>
              <span>{s.desc}</span>
            </div>
            <div className={styles.sessMeta}>
              <b>{s.date}</b>
              {s.length}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** What's included / what to bring grid. */
export function WorkshopNeeds({ workshop }: { workshop: Workshop }) {
  return (
    <section className={styles.sec}>
      <h2>
        What's <em>included</em>, what to bring
      </h2>
      <div className={styles.needGrid}>
        {workshop.needs.map((need) => (
          <div
            key={need.label}
            className={[styles.need, need.included && styles.included]
              .filter(Boolean)
              .join(" ")}
          >
            <b>{need.label}</b>
            {need.tag && <span className={styles.tag}>{need.tag}</span>}
            <br />
            {need.detail}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Past cohort work — placeholder image strip. */
export function WorkshopPastWork({ workshop }: { workshop: Workshop }) {
  if (workshop.pastWork.length === 0) return null;
  return (
    <section className={styles.sec}>
      <h2>
        What previous folks <em>made</em>
      </h2>
      <p>A few pieces from the last cohort:</p>
      <div className={styles.pastGrid}>
        {workshop.pastWork.map((caption, i) => (
          <ImageSlot
            key={i}
            className={styles.pastImg}
            tint={workshop.heroTint}
            radius={14}
            placeholder={caption}
          />
        ))}
      </div>
    </section>
  );
}
