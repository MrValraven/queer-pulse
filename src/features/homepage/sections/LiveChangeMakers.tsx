import { Link } from "react-router-dom";
import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import styles from "./LiveSections.module.css";

/**
 * Live-mode counterpart to `ChangeMakers`: the changemakers an admin has
 * chosen to feature on `/landing/features`, rendered on the same plum panel
 * so the homepage's plum/cream section rhythm is unchanged whichever mode is
 * active. Renders nothing when nothing is curated yet.
 */
export function LiveChangeMakers() {
  const { t } = useTranslation();
  const { changemakers, isLoading } = useLandingFeaturesPublic();

  if (isLoading || changemakers.length === 0) return null;

  return (
    <section
      className={[styles.section, styles.sectionPlum].join(" ")}
      id="changemakers"
    >
      <div className="wrap">
        <div className={styles.head}>
          <div className={styles.headText}>
            <Reveal className={[styles.eyebrow, styles.eyebrowLight].join(" ")}>
              {t("homepage:changeMakers.eyebrow")}
            </Reveal>
            <Reveal
              as="h2"
              className={[styles.title, styles.titleLight].join(" ")}
              delay={60}
            >
              <Translation
                i18nKey="homepage:changeMakers.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal
              as="p"
              className={[styles.sub, styles.subLight].join(" ")}
              delay={90}
            >
              {t("homepage:changeMakers.sub")}
            </Reveal>
          </div>
          <div>
            <Reveal delay={60}>
              <Button variant="ghost-dark" to={routes.changemakers}>
                {t("homepage:changeMakers.cta")}
              </Button>
            </Reveal>
          </div>
        </div>

        <div className={styles.grid}>
          {changemakers.map((person, index) => (
            <Reveal
              key={person.id}
              delay={index * 70}
              as={Link}
              to={`/changemaker/${person.slug}`}
              className={styles.changemakerCard}
            >
              <div className={styles.changemakerCause}>{person.cause}</div>
              <div className={styles.changemakerName}>{person.name}</div>
              <p className={styles.changemakerBlurb}>{person.blurb}</p>
              {person.tags.length > 0 && (
                <div className={styles.changemakerTags}>
                  {person.tags.map((tag) => (
                    <span key={tag} className={styles.changemakerTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
