import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { HOODS, ORGS, COMM_QUICK } from "./arrivingPage.data";
import { HEALTH, HOUSING, type InfoCard } from "./arrivingPageCards.data";
import { MarketingSection } from "./MarketingSection";
import styles from "./ArrivingPage.module.css";

const PLATFORMS = routes.platforms;
const COMMUNITIES = routes.communities;

/** The illustrative "next gathering" shown in FirstStepSection is a fixed
 *  static example (never fetched, no real event behind it), so its date
 *  badge is formatted through `useFormat()` rather than a hardcoded month
 *  string, the same as any other date on the platform. */
const FIRST_GATHERING_DATE = new Date(2026, 5, 14);

export function InfoCards({ cards }: { cards: InfoCard[] }) {
  return (
    <div className={styles.infoGrid}>
      {cards.map((card, index) => (
        <Reveal
          as="div"
          className={styles.infoCard}
          key={card.title}
          delay={index * 55}
        >
          <div className={styles.icHead}>
            <div className={styles.icIcon} style={{ background: card.iconBg }}>
              <card.icon />
            </div>
            <div className={styles.icTitle}>{card.title}</div>
          </div>
          <p className={styles.icBody}>{card.body}</p>
          {card.link &&
            (card.link.external ? (
              <a
                href={card.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.icLink}
              >
                {card.link.label} <FiArrowRight aria-hidden />
              </a>
            ) : (
              <Link to={card.link.href} className={styles.icLink}>
                {card.link.label} <FiArrowRight aria-hidden />
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
    <MarketingSection
      eyebrow={t("marketing:arriving.neighbourhoods.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.neighbourhoods.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.neighbourhoods.intro")}
    >
      <div className={styles.hoodGrid}>
        {HOODS.map((hood, index) => (
          <Reveal
            as="div"
            className={styles.hoodCard}
            key={hood.name}
            delay={index * 55}
          >
            <span
              className={styles.hoodTag}
              style={{ color: hood.tagColor, background: hood.tagBg }}
            >
              {hood.tag}
            </span>
            <div className={styles.hoodName}>{hood.name}</div>
            <p className={styles.hoodDesc}>{hood.description}</p>
            <div className={styles.hoodNote}>{hood.note}</div>
          </Reveal>
        ))}
      </div>
    </MarketingSection>
  );
}

export function HealthSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.health.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.health.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.health.intro")}
    >
      <InfoCards cards={HEALTH} />
    </MarketingSection>
  );
}

export function HousingSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.housing.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.housing.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.housing.intro")}
    >
      <InfoCards cards={HOUSING} />
    </MarketingSection>
  );
}

export function OrgsSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.orgs.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.orgs.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.orgs.intro")}
    >
      <div className={styles.orgList}>
        {ORGS.map((org, index) => (
          <Reveal
            as={Link}
            to={PLATFORMS}
            className={styles.org}
            key={org.name}
            delay={index * 55}
          >
            <div
              className={styles.orgAv}
              style={{ background: org.background, color: org.color }}
            >
              {org.initials}
            </div>
            <div className={styles.orgBody}>
              <div className={styles.orgName}>{org.name}</div>
              <p className={styles.orgDesc}>{org.description}</p>
              <div className={styles.orgUrl}>{org.url}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </MarketingSection>
  );
}

export function FirstStepSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const day = fmt.date(FIRST_GATHERING_DATE, { day: "numeric" });
  const month = fmt.date(FIRST_GATHERING_DATE, { month: "short" });
  return (
    <MarketingSection
      tone="plum"
      eyebrow={t("marketing:arriving.firstStep.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.firstStep.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.firstStep.intro")}
    >
      <Reveal as="div" className={styles.firstGather} delay={160}>
        <div className={styles.fgDate}>
          <span className={styles.d}>{day}</span>
          <span className={styles.m}>{month}</span>
        </div>
        <div className={styles.fgBody}>
          <div className={styles.fgBadge}>
            {t("marketing:arriving.firstStep.example.title")}
          </div>
          <h3>{t("marketing:arriving.firstStep.example.subtitle")}</h3>
          <p>{t("marketing:arriving.firstStep.example.details")}</p>
        </div>
        <Button to={routes.gatherings} variant="ghost-dark">
          {t("marketing:arriving.firstStep.rsvpCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Reveal>
    </MarketingSection>
  );
}

export function CommQuickSection() {
  const { t } = useTranslation();
  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.commQuick.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.commQuick.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.commQuick.intro")}
    >
      <div className={styles.commQuick}>
        {COMM_QUICK.map((community, index) => (
          <Reveal
            as={Link}
            to={COMMUNITIES}
            className={styles.cqCard}
            key={community.name}
            delay={index * 55}
          >
            <span
              className={styles.cqType}
              style={{
                color: community.typeColor,
                background: community.typeBg,
              }}
            >
              {community.type}
            </span>
            <div className={styles.cqName}>{community.name}</div>
            <p className={styles.cqReason}>{community.reason}</p>
          </Reveal>
        ))}
      </div>
      <Reveal as="div" className={styles.commCta} delay={120}>
        <Button to={COMMUNITIES} variant="ghost">
          {t("marketing:arriving.commQuick.browseCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Reveal>
    </MarketingSection>
  );
}
