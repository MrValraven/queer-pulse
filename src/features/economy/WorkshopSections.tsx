import { ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Workshop } from "./workshops.data";
import styles from "./WorkshopPage.module.css";

/** "What you'll actually do" — the intro prose. */
export function WorkshopAbout({ workshop }: { workshop: Workshop }) {
  return (
    <section className={styles.sec}>
      <h2>
        <Translation
          i18nKey="economy:workshopSections.about.title"
          components={{ em: <em /> }}
        />
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
        <Translation
          i18nKey="economy:workshopSections.sessions.title"
          values={{ count: workshop.sessions.length }}
          components={{ em: <em /> }}
        />
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
        <Translation
          i18nKey="economy:workshopSections.needs.title"
          components={{ em: <em /> }}
        />
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
  const { t } = useTranslation();
  if (workshop.pastWork.length === 0) return null;
  return (
    <section className={styles.sec}>
      <h2>
        <Translation
          i18nKey="economy:workshopSections.pastWork.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p>{t("economy:workshopSections.pastWork.intro")}</p>
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
