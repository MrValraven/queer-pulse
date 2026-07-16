import { FiAward, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Avatar, Reveal, SectionHead } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LANDLORDS } from "./landlords";
import { TIPS } from "./housing.data";
import styles from "./HousingPage.module.css";

export function HousingLandlords() {
  const { t } = useTranslation();
  return (
    <section className={styles.landlords}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="economy:housing.landlords.heading"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("economy:housing.landlords.subtitle")}
          />
        </Reveal>
        <div className={styles.llGrid}>
          {LANDLORDS.map((landlord, index) => (
            <Reveal
              as={Link}
              key={landlord.name}
              to={`/work/landlord/${landlord.slug}`}
              className={styles.llCard}
              delay={index * 55}
            >
              <span className={styles.llAvatar}>
                <Avatar
                  initials={landlord.initials}
                  tint={landlord.tint}
                  src={landlord.photo}
                  size={52}
                />
                <span
                  className={styles.llBadge}
                  title={t("economy:housing.landlords.endorsedBadge")}
                >
                  <FiAward />
                </span>
              </span>
              <div>
                <div className={styles.llName}>{landlord.name}</div>
                <div className={styles.llHood}>{landlord.hood}</div>
                <div className={styles.llStars}>
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <FiStar
                      key={starIndex}
                      className={
                        starIndex < landlord.stars ? styles.llStarOn : undefined
                      }
                    />
                  ))}
                </div>
                <div className={styles.llNote}>{landlord.note}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HousingTips() {
  const { t } = useTranslation();
  return (
    <section className={styles.tips}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="economy:housing.tipsHeading"
                components={{ em: <em /> }}
              />
            }
          />
        </Reveal>
        <div className={styles.tipsGrid}>
          {TIPS.map((tip, tipIndex) => (
            <Reveal
              as="div"
              key={tip.num}
              className={styles.tipCard}
              delay={tipIndex * 55}
            >
              <div className={styles.tipNum}>{tip.num}</div>
              <div className={styles.tipTitle}>{t(tip.titleKey)}</div>
              <div className={styles.tipText}>{t(tip.textKey)}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
