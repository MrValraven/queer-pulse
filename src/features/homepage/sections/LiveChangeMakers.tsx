import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import { ChangemakerGrid } from "./ChangemakerGrid";
import styles from "./LiveSections.module.css";

/**
 * Live-mode counterpart to `ChangeMakers`: the changemakers an admin has
 * chosen to feature on `/landing/features`, rendered on the same plum panel
 * so the homepage's plum/cream section rhythm is unchanged whichever mode is
 * active. Renders nothing when nothing is curated yet.
 */
export function LiveChangeMakers() {
  const { t } = useTranslation();
  const { changemakers, isLoading, isError } = useLandingFeaturesPublic();

  // A failed fetch renders nothing, like an empty slice does. This is the
  // marketing homepage: a visitor has no stake in this teaser row and cannot
  // act on a failure here, and an alert panel between the curated plum and
  // cream sections would cost more than the row is worth. The real board is a
  // click away in the nav. The flag is read explicitly so the choice is a
  // decision rather than an accident.
  if (isLoading || isError || changemakers.length === 0) return null;

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

        <ChangemakerGrid items={changemakers} />
      </div>
    </section>
  );
}
