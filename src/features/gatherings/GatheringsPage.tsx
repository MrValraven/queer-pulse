import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { spotsText } from "./data";
import { FEATURED, HOOD_KEYS, WAYS } from "./gatheringsPage.data";
import styles from "./GatheringsPage.module.css";

export function GatheringsPage() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>
            {t("gatherings:landing.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            <Translation
              i18nKey="gatherings:landing.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            {t("gatherings:landing.hero.lead")}
          </Reveal>
          <Reveal className={styles.hoods} delay={160}>
            {HOOD_KEYS.map((hoodKey) => (
              <span key={hoodKey} className={styles.hood}>
                {t(hoodKey)}
              </span>
            ))}
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="gatherings:landing.ways.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("gatherings:landing.ways.lead")}
          </Reveal>
          <div className={styles.grid}>
            {WAYS.map((way, index) => (
              <Reveal
                key={way.titleKey}
                className={styles.wayCard}
                delay={index * 55}
              >
                <div className={styles.wayIcon}>
                  <way.icon />
                </div>
                <div className={styles.wayTitle}>{t(way.titleKey)}</div>
                <div className={styles.wayBody}>{t(way.bodyKey)}</div>
                <Link to={way.to} className={styles.wayLink}>
                  {t(way.ctaKey)} →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="gatherings:landing.featured.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("gatherings:landing.featured.lead")}
          </Reveal>
          <div className={styles.events}>
            {FEATURED.map((event, index) => (
              <Reveal
                key={event.title}
                as={Link}
                to={event.to}
                className={styles.event}
                delay={index * 55}
              >
                <div className={styles.date}>
                  <div className={styles.dateDd}>
                    {fmt.date(event.date, { day: "2-digit" })}
                  </div>
                  <div className={styles.dateMm}>
                    {fmt.date(event.date, { month: "short" })}
                  </div>
                </div>
                <div className={styles.eventBody}>
                  <div className={styles.eventType}>{event.type}</div>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventMeta}>{event.hood}</div>
                </div>
                <span className={styles.eventSpots}>
                  {spotsText(event.spots, t, fmt)}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="gatherings:landing.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("gatherings:landing.outro.sub")}
      >
        <Button to={routes.events} variant="primary" size="lg">
          {t("gatherings:landing.outro.browseCta")}
        </Button>
        <Button to={routes.host} variant="ghost-dark" size="lg">
          {t("gatherings:landing.outro.hostCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
