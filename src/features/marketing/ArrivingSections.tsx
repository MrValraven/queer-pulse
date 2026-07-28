import { Link } from "react-router-dom";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { HOODS, ORGS, COMM_QUICK } from "./arrivingPage.data";
import { HEALTH, HOUSING, type InfoCard } from "./arrivingPageCards.data";
import styles from "./ArrivingPage.module.css";

const PLATFORMS = routes.platforms;
const COMMUNITIES = routes.communities;

export function InfoCards({ cards }: { cards: InfoCard[] }) {
  return (
    <div className={styles.infoGrid}>
      {cards.map((c, i) => (
        <Reveal
          as="div"
          className={styles.infoCard}
          key={c.title}
          delay={i * 55}
        >
          <div className={styles.icHead}>
            <div className={styles.icIcon} style={{ background: c.iconBg }}>
              <c.icon />
            </div>
            <div className={styles.icTitle}>{c.title}</div>
          </div>
          <p className={styles.icBody}>{c.body}</p>
          {c.link &&
            (c.link.external ? (
              <a
                href={c.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.icLink}
              >
                {c.link.label}
              </a>
            ) : (
              <Link to={c.link.href} className={styles.icLink}>
                {c.link.label}
              </Link>
            ))}
        </Reveal>
      ))}
    </div>
  );
}

export function NeighbourhoodsSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.section} ${styles.alt}`}>
      <div className="wrap">
        <Reveal as="div" className={styles.eye}>
          {t("marketing:arriving.neighbourhoods.eyebrow")}
        </Reveal>
        <Reveal as="h2" className={styles.h} delay={60}>
          <Translation
            i18nKey="marketing:arriving.neighbourhoods.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={120}>
          {t("marketing:arriving.neighbourhoods.intro")}
        </Reveal>
        <div className={styles.hoodGrid}>
          {HOODS.map((h, i) => (
            <Reveal
              as="div"
              className={styles.hoodCard}
              key={h.name}
              delay={i * 55}
            >
              <span
                className={styles.hoodTag}
                style={{ color: h.tagColor, background: h.tagBg }}
              >
                {h.tag}
              </span>
              <div className={styles.hoodName}>{h.name}</div>
              <p className={styles.hoodDesc}>{h.description}</p>
              <div className={styles.hoodNote}>{h.note}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HealthSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.section} ${styles.paper}`}>
      <div className="wrap">
        <Reveal as="div" className={styles.eye}>
          {t("marketing:arriving.health.eyebrow")}
        </Reveal>
        <Reveal as="h2" className={styles.h} delay={60}>
          <Translation
            i18nKey="marketing:arriving.health.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={120}>
          {t("marketing:arriving.health.intro")}
        </Reveal>
        <InfoCards cards={HEALTH} />
      </div>
    </section>
  );
}

export function HousingSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.section} ${styles.alt}`}>
      <div className="wrap">
        <Reveal as="div" className={styles.eye}>
          {t("marketing:arriving.housing.eyebrow")}
        </Reveal>
        <Reveal as="h2" className={styles.h} delay={60}>
          <Translation
            i18nKey="marketing:arriving.housing.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={120}>
          {t("marketing:arriving.housing.intro")}
        </Reveal>
        <InfoCards cards={HOUSING} />
      </div>
    </section>
  );
}

export function OrgsSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.section} ${styles.paper}`}>
      <div className="wrap">
        <Reveal as="div" className={styles.eye}>
          {t("marketing:arriving.orgs.eyebrow")}
        </Reveal>
        <Reveal as="h2" className={styles.h} delay={60}>
          <Translation
            i18nKey="marketing:arriving.orgs.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={120}>
          {t("marketing:arriving.orgs.intro")}
        </Reveal>
        <div className={styles.orgList}>
          {ORGS.map((o, i) => (
            <Reveal
              as={Link}
              to={PLATFORMS}
              className={styles.org}
              key={o.name}
              delay={i * 55}
            >
              <div
                className={styles.orgAv}
                style={{ background: o.background, color: o.color }}
              >
                {o.initials}
              </div>
              <div className={styles.orgBody}>
                <div className={styles.orgName}>{o.name}</div>
                <p className={styles.orgDesc}>{o.description}</p>
                <div className={styles.orgUrl}>{o.url}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FirstStepSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.section} ${styles.dark}`}>
      <div className="wrap">
        <Reveal as="div" className={styles.eye}>
          {t("marketing:arriving.firstStep.eyebrow")}
        </Reveal>
        <Reveal as="h2" className={styles.h} delay={60}>
          <Translation
            i18nKey="marketing:arriving.firstStep.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={120}>
          {t("marketing:arriving.firstStep.intro")}
        </Reveal>
        <Reveal as="div" className={styles.firstGather} delay={160}>
          <div className={styles.fgDate}>
            <span className={styles.d}>14</span>
            <span className={styles.m}>Jun</span>
          </div>
          <div className={styles.fgBody}>
            <div className={styles.fgBadge}>Portfolio Night</div>
            <h3>Designers &amp; Photographers</h3>
            <p>
              Príncipe Real · From 7pm · Casual, warm, no agenda. Bring your
              work or just yourself.
            </p>
          </div>
          <Button to={routes.gatherings} variant="ghost-dark">
            {t("marketing:arriving.firstStep.rsvpCta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function CommQuickSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.section} ${styles.alt}`}>
      <div className="wrap">
        <Reveal as="div" className={styles.eye}>
          {t("marketing:arriving.commQuick.eyebrow")}
        </Reveal>
        <Reveal as="h2" className={styles.h} delay={60}>
          <Translation
            i18nKey="marketing:arriving.commQuick.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.intro} delay={120}>
          {t("marketing:arriving.commQuick.intro")}
        </Reveal>
        <div className={styles.commQuick}>
          {COMM_QUICK.map((c, i) => (
            <Reveal
              as={Link}
              to={COMMUNITIES}
              className={styles.cqCard}
              key={c.name}
              delay={i * 55}
            >
              <span
                className={styles.cqType}
                style={{ color: c.typeColor, background: c.typeBg }}
              >
                {c.type}
              </span>
              <div className={styles.cqName}>{c.name}</div>
              <p className={styles.cqReason}>{c.reason}</p>
            </Reveal>
          ))}
        </div>
        <Reveal as="div" className={styles.commCta} delay={120}>
          <Button to={COMMUNITIES} variant="ghost">
            {t("marketing:arriving.commQuick.browseCta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
