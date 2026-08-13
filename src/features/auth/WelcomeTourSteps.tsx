import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { Button, Select } from "../../shared/components/ui";
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
        <Translation
          i18nKey="auth:tour.welcome.heading"
          components={{ em: <em /> }}
        />
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
        <span className={styles.q101Label}>
          {t("auth:tour.welcome.q101Label")}
        </span>
        <Translation
          i18nKey="auth:tour.welcome.q101Body"
          components={{
            q101: <Link to={routes.queer101} className={styles.q101Link} />,
          }}
        />
      </div>
      <div className={styles.nav}>
        <span />
        <Button onClick={onNext}>
          {t("auth:tour.welcome.cta")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </>
  );
}

export function TourProfile({ onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const [visibility, setVisibility] = useState("open");
  const [neighbourhood, setNeighbourhood] = useState<string | null>(null);
  return (
    <>
      <div className={styles.eye}>{t("auth:tour.profile.eyebrow")}</div>
      <h2 className={styles.h}>
        <Translation
          i18nKey="auth:tour.profile.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.p}>{t("auth:tour.profile.body")}</p>
      <div className={styles.fields}>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder={t("auth:tour.profile.namePlaceholder")}
            aria-label={t("auth:tour.profile.namePlaceholder")}
          />
          <input
            className={styles.input}
            type="text"
            placeholder={t("auth:tour.profile.pronounsPlaceholder")}
            aria-label={t("auth:tour.profile.pronounsPlaceholder")}
          />
        </div>
        <input
          className={styles.input}
          type="text"
          placeholder={t("auth:tour.profile.rolePlaceholder")}
          aria-label={t("auth:tour.profile.rolePlaceholder")}
        />
        <Select
          label={t("auth:tour.profile.neighbourhoodDefault")}
          placeholder={t("auth:tour.profile.neighbourhoodDefault")}
          value={neighbourhood}
          onChange={setNeighbourhood}
          options={NEIGHBOURHOOD_KEYS.map((hoodKey) => ({
            value: hoodKey,
            label: t(hoodKey),
          }))}
        />
      </div>
      <div className={styles.fieldLabel}>
        {t("auth:tour.profile.visibilityLabel")}
      </div>
      <div className={styles.visOpts}>
        {VISIBILITY_OPTIONS.map((opt) => (
          <label key={opt.value} className={styles.visOpt}>
            <input
              type="radio"
              name="vis"
              aria-label={t(opt.titleKey)}
              value={opt.value}
              checked={visibility === opt.value}
              onChange={() => setVisibility(opt.value)}
            />
            <span className={styles.visText}>
              <span>{t(opt.titleKey)}</span>
              <small>{t(opt.descriptionKey)}</small>
            </span>
          </label>
        ))}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:tour.nav.back")}
        </button>
        <Button onClick={onNext}>
          {t("auth:tour.nav.continue")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </>
  );
}

export function TourInterests({ onNext, onBack }: StepProps) {
  const { t } = useTranslation();
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
      <div className={styles.eye}>{t("auth:tour.interests.eyebrow")}</div>
      <h2 className={styles.h}>
        <Translation
          i18nKey="auth:tour.interests.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.p}>{t("auth:tour.interests.body")}</p>
      <div className={styles.intGrid}>
        {INTERESTS.map((interest) => {
          const label = t(interest.labelKey);
          return (
            <button
              key={interest.value}
              type="button"
              className={[styles.intItem, selected.has(label) && styles.intSel]
                .filter(Boolean)
                .join(" ")}
              onClick={() => toggle(label)}
            >
              <span className={styles.intIcon}>
                <interest.icon />
              </span>
              <span className={styles.intLabel}>{label}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:tour.nav.back")}
        </button>
        <Button onClick={onNext}>
          {t("auth:tour.nav.continue")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </>
  );
}

export function TourCommunities({ onNext, onBack }: StepProps) {
  const { t } = useTranslation();
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
      <div className={styles.eye}>{t("auth:tour.communities.eyebrow")}</div>
      <h2 className={styles.h}>
        <Translation
          i18nKey="auth:tour.communities.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.p}>{t("auth:tour.communities.body")}</p>
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
              aria-label={community.name}
              checked={joined.has(community.name)}
              onChange={() => toggle(community.name)}
            />
            <span>
              <span className={styles.commName}>{community.name}</span>
              <span className={styles.commDesc}>{community.description}</span>
            </span>
          </label>
        ))}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:tour.nav.back")}
        </button>
        <Button onClick={onNext}>
          {t("auth:tour.nav.continue")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </>
  );
}

export function TourConnections({ onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const [sent, setSent] = useState<Set<string>>(new Set());
  return (
    <>
      <div className={styles.eye}>{t("auth:tour.connections.eyebrow")}</div>
      <h2 className={styles.h}>
        <Translation
          i18nKey="auth:tour.connections.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.p}>{t("auth:tour.connections.body")}</p>
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
                    {t("auth:tour.connections.sent")} <FiCheck />
                  </>
                ) : (
                  t("auth:tour.connections.sayHello")
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.nav}>
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:tour.nav.back")}
        </button>
        <Button onClick={onNext}>
          {t("auth:tour.nav.continue")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </>
  );
}

export function TourExplore() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.eye}>{t("auth:tour.explore.eyebrow")}</div>
      <h2 className={styles.h}>
        <Translation
          i18nKey="auth:tour.explore.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.p}>{t("auth:tour.explore.body")}</p>
      <div className={styles.exploreGrid}>
        {EXPLORE_CARDS.map((card) => (
          <Link
            key={card.nameKey}
            to={linkToPath(card.href)}
            className={styles.exCard}
          >
            <div className={styles.exIcon}>
              <card.icon />
            </div>
            <div className={styles.exName}>{t(card.nameKey)}</div>
            <div className={styles.exDesc}>{t(card.descriptionKey)}</div>
          </Link>
        ))}
      </div>
      <Button to={routes.homepage} className={styles.goBtn}>
        {t("auth:tour.explore.cta")} <FiArrowRight aria-hidden />
      </Button>
    </>
  );
}
