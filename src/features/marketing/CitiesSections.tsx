import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { BETA, WAITLIST, HOW } from "./cities.data";
import styles from "./CitiesPage.module.css";

export function GroundworkSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <section>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:cities.groundwork.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.meta}>
          {t("marketing:cities.groundwork.meta")}
        </span>
      </div>
      <div className={styles.betaGrid}>
        {BETA.map((b) => (
          <div className={styles.betaCard} key={b.name}>
            <div className={styles.cityHRow}>
              <div className={styles.cityName}>
                {b.name}
                <em>.</em>
              </div>
              <span className={styles.cityFlag}>
                <span className={styles.dot}>{b.flag}</span>
                {b.country}
              </span>
            </div>
            <p>{b.desc}</p>
            <div className={styles.betaLead}>{b.lead}</div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => showToast(b.toast, "success")}
            >
              {b.btn}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WaitlistSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [voted, setVoted] = useState<Record<string, boolean>>(
    Object.fromEntries(
      WAITLIST.filter((w) => w.voted).map((w) => [w.name, true]),
    ),
  );

  const vote = (name: string) => {
    setVoted((prev) => ({ ...prev, [name]: true }));
    showToast(t("marketing:cities.waitlist.voteToast"), "success");
  };

  return (
    <section>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:cities.waitlist.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.meta}>
          {t("marketing:cities.waitlist.meta")}
        </span>
      </div>
      <p className={styles.wlIntro}>
        <Translation
          i18nKey="marketing:cities.waitlist.intro"
          components={{ em: <em /> }}
        />
      </p>
      {WAITLIST.map((w) => {
        const hasVoted = voted[w.name];
        return (
          <div className={styles.wlRow} key={w.name}>
            <div className={styles.wlCity}>
              <b>{w.name}</b>
              <span>
                {w.flag} {w.region}
              </span>
            </div>
            <div>
              <div className={styles.wlVotes}>
                <em>{w.votes}</em>
              </div>
              <div className={styles.wlVotesL}>
                {t("marketing:cities.waitlist.membersAsking")}
              </div>
            </div>
            <div className={styles.wlProgress}>
              <div className={styles.wlBar}>
                <span style={{ width: `${w.pct}%` }} />
              </div>
              <span className={styles.wlPct}>
                {t("marketing:cities.waitlist.pctToThreshold", { pct: w.pct })}
              </span>
            </div>
            {hasVoted ? (
              <button
                type="button"
                className={`${styles.wlVoteBtn} ${styles.wlVoteBtnVoted}`}
                disabled
              >
                <FiCheck /> {t("marketing:cities.waitlist.votedCta")}
              </button>
            ) : (
              <button
                type="button"
                className={styles.wlVoteBtn}
                onClick={() => vote(w.name)}
              >
                {t("marketing:cities.waitlist.voteCta")}
              </button>
            )}
          </div>
        );
      })}
      <p className={styles.wlFoot}>
        <Translation
          i18nKey="marketing:cities.waitlist.footNote"
          components={{ a: <Link to={routes.contact} /> }}
        />
      </p>
    </section>
  );
}

export function HowSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.howSection}>
      <div className={styles.howInner}>
        <div className={styles.howKicker}>
          {t("marketing:cities.how.kicker")}
        </div>
        <h2>
          <Translation
            i18nKey="marketing:cities.how.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.howIntro}>{t("marketing:cities.how.intro")}</p>
        <div className={styles.howList}>
          {HOW.map((h) => (
            <div className={styles.howRow} key={h.n}>
              <div className={styles.howN}>
                {h.n[0]}
                <em>{h.n[1]}</em>
              </div>
              <div>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
