import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./PitchTrackerPage.module.css";

export function PitchTrackerHeader() {
  const { t } = useTranslation();
  return (
    <header className={styles.head}>
      <div>
        <div className={styles.eyebrow}>
          {t("magazine:pitchTracker.header.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="magazine:pitchTracker.header.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="magazine:pitchTracker.header.lead"
            components={{ b: <b /> }}
            values={{ active: 7, published: 4, days: 6 }}
          />
        </p>
      </div>
      <Button variant="primary" to={routes.submitStory}>
        {t("magazine:pitchTracker.header.newPitchCta")}
      </Button>
    </header>
  );
}
