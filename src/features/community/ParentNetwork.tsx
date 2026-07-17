import { Link } from "react-router-dom";
import { Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { MEETUPS, OFFERS, RESOURCES, STATS } from "./parents.data";
import styles from "./ParentNetwork.module.css";

/**
 * The "already raising kids" half of the Family & parenting hub — the Queer
 * Parent Network. Rendered as a section inside FamilyPage; the standalone
 * /parents route redirects here.
 */
export function ParentNetwork() {
  const { t } = useTranslation();
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

          <Reveal className={styles.resList} delay={120}>
            {RESOURCES.map((resource) => (
              <Link
                key={resource.to}
                to={resource.to}
                className={styles.resLink}
              >
                {t(`community:${resource.titleKey}`)}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
