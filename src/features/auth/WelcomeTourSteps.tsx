import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes, linkToPath } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  VOUCH,
  NEIGHBOURHOOD_KEYS,
  VISIBILITY_OPTIONS,
  INTERESTS,
  TOUR_COMMUNITIES,
  CONNECTIONS,
  EXPLORE_CARDS,
} from "./welcomeTour.data";
import styles from "./WelcomeTourPage.module.css";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function TourWelcome({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.eye}>{t("auth:tour.welcome.eyebrow")}</div>
      <h1 className={styles.h}>
        <Translation i18nKey="auth:tour.welcome.heading" components={{ em: <em /> }} />
      </h1>
      <p className={styles.p}>{t("auth:tour.welcome.body")}</p>
      <div className={styles.vouchCard}>
        <div className={styles.vcAv}>{VOUCH.initials}</div>
        <div>
          <div className={styles.vcName}>{VOUCH.name}</div>
          <div className={styles.vcRole}>{VOUCH.role}</div>
          <div className={styles.vcNote}>"{VOUCH.note}"</div>
        </div>
      </div>
      <div className={styles.q101}>
        <span className={styles.q101Label}>{t("auth:tour.welcome.q101Label")}</span>
        <Translation
          i18nKey="auth:tour.welcome.q101Body"
          components={{
            q101: <Link to={routes.queer101} className={styles.q101Link} />,
          }}
        />
      </div>
      <div className={styles.nav}>
        <span />
        <Button onClick={onNext}>{t("auth:tour.welcome.cta")}</Button>
      </div>
    </>
  );
}

export function TourProfile({ onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const [visibility, setVisibility] = useState("open");
  return (
    <>
      <div className={styles.eye}>{t("auth:tour.profile.eyebrow")}</div>
      <h2 className={styles.h}>
        <Translation i18nKey="auth:tour.profile.heading" components={{ em: <em /> }} />
      </h2>
      <p className={styles.p}>{t("auth:tour.profile.body")}</p>
      <div className={styles.fields}>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder={t("auth:tour.profile.namePlaceholder")}
          />
          <input
            className={styles.input}
            type="text"
            placeholder={t("auth:tour.profile.pronounsPlaceholder")}
          />
        </div>
        <input
          className={styles.input}
          type="text"
          placeholder={t("auth:tour.profile.rolePlaceholder")}
        />
        <select className={styles.select} defaultValue="">
          <option value="">{t("auth:tour.profile.neighbourhoodDefault")}</option>
          {NEIGHBOURHOOD_KEYS.map((hoodKey) => (
            <option key={hoodKey}>{t(hoodKey)}</option>
          ))}
        </select>
      </div>
      <div className={styles.fieldLabel}>{t("auth:tour.profile.visibilityLabel")}</div>
      <div className={styles.visOpts}>
        {VISIBILITY_OPTIONS.map((opt) => (
          <label key={opt.value} className={styles.visOpt}>
            <input
              type="radio"
              name="vis"
              value={opt.value}
              checked={visibility === opt.value}
              onChange={() => setVisibility(opt.value)}
            />
            <span className={styles.visText}>
              <span>{t(opt.titleKey)}</span>
              <small>{t(opt.descKey)}</small>
            </span>
          </label>
        ))}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          {t("auth:tour.nav.back")}
        </button>
        <Button onClick={onNext}>{t("auth:tour.nav.continue")}</Button>
      </div>
    </>
  );
}

export function TourInterests({ onNext, onBack }: StepProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  function toggle(label: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }
  return (
    <>
      <div className={styles.eye}>Your world</div>
      <h2 className={styles.h}>
        What matters <em>to you?</em>
      </h2>
      <p className={styles.p}>
        We use this to suggest connections, gatherings, and communities. Select
        as many as you like.
      </p>
      <div className={styles.intGrid}>
        {INTERESTS.map((interest) => (
          <button
            key={interest.label}
            type="button"
            className={[
              styles.intItem,
              selected.has(interest.label) && styles.intSel,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => toggle(interest.label)}
          >
            <span className={styles.intIcon}>
              <interest.icon />
            </span>
            <span className={styles.intLabel}>{interest.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← Back
        </button>
        <Button onClick={onNext}>Continue →</Button>
      </div>
    </>
  );
}

export function TourCommunities({ onNext, onBack }: StepProps) {
  const [joined, setJoined] = useState<Set<string>>(new Set());
  function toggle(name: string) {
    setJoined((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }
  return (
    <>
      <div className={styles.eye}>Your spaces</div>
      <h2 className={styles.h}>
        Which communities <em>call to you?</em>
      </h2>
      <p className={styles.p}>
        Join now or explore later — you can always change this. Your choices are
        private.
      </p>
      <div className={styles.commList}>
        {TOUR_COMMUNITIES.map((community) => (
          <label
            key={community.name}
            className={[
              styles.commPick,
              joined.has(community.name) && styles.commPicked,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="checkbox"
              checked={joined.has(community.name)}
              onChange={() => toggle(community.name)}
            />
            <span>
              <span className={styles.commName}>{community.name}</span>
              <span className={styles.commDesc}>{community.desc}</span>
            </span>
          </label>
        ))}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← Back
        </button>
        <Button onClick={onNext}>Continue →</Button>
      </div>
    </>
  );
}

export function TourConnections({ onNext, onBack }: StepProps) {
  const [sent, setSent] = useState<Set<string>>(new Set());
  return (
    <>
      <div className={styles.eye}>First connections</div>
      <h2 className={styles.h}>
        Three people worth <em>saying hello to.</em>
      </h2>
      <p className={styles.p}>
        These are members who often welcome new arrivals. A quick message goes a
        long way.
      </p>
      <div className={styles.sugGrid}>
        {CONNECTIONS.map((person) => {
          const isSent = sent.has(person.name);
          return (
            <div key={person.name} className={styles.sugCard}>
              <div className={[styles.sugAv, styles[person.tint]].join(" ")}>
                {person.initials}
              </div>
              <div className={styles.sugInfo}>
                <div className={styles.sugName}>{person.name}</div>
                <div className={styles.sugRole}>{person.role}</div>
                <div className={styles.sugReason}>{person.reason}</div>
              </div>
              <button
                type="button"
                className={[styles.sugSay, isSent && styles.sugSent]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setSent((current) => new Set(current).add(person.name))
                }
              >
                {isSent ? (
                  <>
                    Sent <FiCheck />
                  </>
                ) : (
                  "Say hello"
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← Back
        </button>
        <Button onClick={onNext}>Continue →</Button>
      </div>
    </>
  );
}

export function TourExplore() {
  return (
    <>
      <div className={styles.eye}>You're all set</div>
      <h2 className={styles.h}>
        Welcome to the <em>community.</em>
      </h2>
      <p className={styles.p}>
        You're officially in. Here's where to go first — there's no right
        answer, just what calls to you.
      </p>
      <div className={styles.exploreGrid}>
        {EXPLORE_CARDS.map((card) => (
          <Link
            key={card.name}
            to={linkToPath(card.href)}
            className={styles.exCard}
          >
            <div className={styles.exIcon}>
              <card.icon />
            </div>
            <div className={styles.exName}>{card.name}</div>
            <div className={styles.exDesc}>{card.desc}</div>
          </Link>
        ))}
      </div>
      <Button to={routes.homepage} className={styles.goBtn}>
        Go to QueerPulse →
      </Button>
    </>
  );
}
