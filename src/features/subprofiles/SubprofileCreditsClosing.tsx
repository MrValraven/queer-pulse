import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileCreditsClosing.module.css";

/**
 * Closing band of the personas directory: a plum, rounded call to action
 * inviting the viewer to make their own persona. Static copy, always shown,
 * and it links straight to the create flow of the personas dashboard.
 */
export function SubprofileCreditsClosing() {
  const { t } = useTranslation();

  return (
    <section
      className={styles.section}
      aria-labelledby="subprofile-credits-closing-title"
    >
      <div className={styles.band}>
        <div className={styles.copy}>
          <h2 id="subprofile-credits-closing-title" className={styles.title}>
            <Translation
              i18nKey="subprofiles:directory.closing.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.lead}>
            {t("subprofiles:directory.closing.lead")}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className={styles.cta}
          to={`${routes.subprofilesDashboard}?create=1`}
        >
          {t("subprofiles:directory.closing.cta")}
        </Button>
      </div>
    </section>
  );
}
