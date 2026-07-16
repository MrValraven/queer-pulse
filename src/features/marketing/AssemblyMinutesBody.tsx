import { FiCheck, FiX, FiClock } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  type AssemblyMinutes,
  type MinutesResolution,
} from "./assemblyMinutes.data";
import styles from "./AssemblyMinutesPage.module.css";

const OUTCOME_KEYS: Record<MinutesResolution["outcome"], string> = {
  Passed: "marketing:assemblyMinutes.outcome.passed",
  Rejected: "marketing:assemblyMinutes.outcome.rejected",
  Tabled: "marketing:assemblyMinutes.outcome.tabled",
};

function OutcomeTag({ outcome }: { outcome: MinutesResolution["outcome"] }) {
  const { t } = useTranslation();
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
      <Icon aria-hidden /> {t(OUTCOME_KEYS[outcome])}
    </span>
  );
}

export function AssemblyMinutesBody({ minutes }: { minutes: AssemblyMinutes }) {
  const { t } = useTranslation();
  return (
    <div className={styles.body}>
      <section className={styles.metaCard}>
        <div className={styles.metaGrid}>
          <div>
            <span className={styles.metaLabel}>
              {t("marketing:assemblyMinutes.meta.date")}
            </span>
            <b>{minutes.date}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>
              {t("marketing:assemblyMinutes.meta.location")}
            </span>
            <b>{minutes.location}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>
              {t("marketing:assemblyMinutes.meta.chair")}
            </span>
            <b>{minutes.chair}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>
              {t("marketing:assemblyMinutes.meta.secretary")}
            </span>
            <b>{minutes.secretary}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>
              {t("marketing:assemblyMinutes.meta.quorum")}
            </span>
            <b>{minutes.quorum}</b>
          </div>
          <div>
            <span className={styles.metaLabel}>
              {t("marketing:assemblyMinutes.meta.attendance")}
            </span>
            <b>
              {t("marketing:assemblyMinutes.meta.attendanceValue", {
                inPerson: minutes.attendeesInPerson,
                online: minutes.attendeesOnline,
                votes: minutes.votesCast,
              })}
            </b>
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="marketing:assemblyMinutes.summary.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.summary}>{minutes.summary}</p>
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="marketing:assemblyMinutes.agenda.title"
            components={{ em: <em /> }}
          />
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
          <Translation
            i18nKey="marketing:assemblyMinutes.resolutions.title"
            components={{ em: <em /> }}
          />
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
          <Translation
            i18nKey="marketing:assemblyMinutes.actions.title"
            components={{ em: <em /> }}
          />
        </h2>
        <ul className={styles.actions}>
          {minutes.actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      <div className={styles.signoff}>
        {t("marketing:assemblyMinutes.signoff", {
          secretary: minutes.secretary,
          year: minutes.year,
        })}
      </div>
    </div>
  );
}
