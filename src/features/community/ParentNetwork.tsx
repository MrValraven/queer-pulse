import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import { EmptyState, Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MEETUPS, OFFERS, RESOURCES, STATS } from "./parents.data";
import styles from "./ParentNetwork.module.css";

/**
 * The "already raising kids" half of the Family & parenting hub — the Queer
 * Parent Network. Rendered as a section inside FamilyPage; the standalone
 * /parents route redirects here.
 */
export function ParentNetwork() {
  const { t } = useTranslation();
  // The headline stats and upcoming meetups are demo fiction — live has no
  // membership counts or events backend yet, so hide the numbers and show an
  // honest empty calendar rather than inventing gatherings.
  const { demoMode } = useDemoMode();
  return (
    <>
      <section className={styles.section}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>
            {t("community:parentNetwork.eyebrow")}
          </Reveal>
          <Reveal as="h2" className={styles.h2} delay={60}>
            <Translation
              i18nKey="community:parentNetwork.heading"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={120}>
            {t("community:parentNetwork.lead")}
          </Reveal>
          {demoMode && (
            <Reveal className={styles.stats} delay={160}>
              {STATS.map((stat) => (
                <div key={stat.labelKey}>
                  <div className={styles.statN}>{stat.n}</div>
                  <div className={styles.statL}>
                    {t(`community:${stat.labelKey}`)}
                  </div>
                </div>
              ))}
            </Reveal>
          )}
          <div className={styles.grid} style={{ marginTop: 40 }}>
            {OFFERS.map((offer, index) => (
              <Reveal
                key={offer.titleKey}
                className={styles.card}
                delay={index * 55}
              >
                <div className={styles.cardIcon}>
                  <offer.icon />
                </div>
                <div className={styles.cardTitle}>
                  {t(`community:${offer.titleKey}`)}
                </div>
                <div className={styles.cardBody}>
                  {t(`community:${offer.bodyKey}`)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="community:parentNetwork.comingUp.heading"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("community:parentNetwork.comingUp.lead")}
          </Reveal>
          {demoMode ? (
            <div className={styles.meetups}>
              {MEETUPS.map((meetup, index) => (
                <Reveal
                  key={meetup.title}
                  className={styles.meetup}
                  delay={index * 55}
                >
                  <div className={styles.date}>
                    <div className={styles.dateDd}>{meetup.dd}</div>
                    <div className={styles.dateMm}>{meetup.mm}</div>
                  </div>
                  <div className={styles.meetupBody}>
                    <div className={styles.meetupTitle}>{meetup.title}</div>
                    <div className={styles.meetupMeta}>{meetup.meta}</div>
                  </div>
                  <span className={styles.meetupTag}>
                    {t(`community:${meetup.tagKey}`)}
                  </span>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FiCalendar />}
              title={t("community:parentNetwork.comingUp.liveEmpty.title")}
              description={t(
                "community:parentNetwork.comingUp.liveEmpty.description",
              )}
            />
          )}

          <Reveal className={styles.resList} delay={120}>
            {RESOURCES.map((resource) => (
              <Link
                key={resource.to}
                to={resource.to}
                className={styles.resLink}
              >
                {t(`community:${resource.titleKey}`)}
                <FiArrowRight className={styles.resLinkArrow} aria-hidden />
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
