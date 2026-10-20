import { FiRadio } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Button } from "../../../shared/components/ui/Button";
import { quizshowPlayPath } from "../quizshowPaths";
import styles from "./QuizshowEvent.module.css";

/** Shown while a lobby or game is open for the event. */
export function QuizshowEventBanner({ code }: { code: string }) {
  const { t } = useTranslation();
  return (
    <section className={styles.banner} aria-labelledby="quizshow-banner-title">
      <span className={styles.bannerIcon} aria-hidden="true">
        <FiRadio />
      </span>
      <div className={styles.bannerText}>
        <h2 id="quizshow-banner-title" className={styles.bannerTitle}>
          {t("quizshow:event.banner.title")}
        </h2>
        <p className={styles.bannerBody}>
          {t("quizshow:event.banner.body", { code })}
        </p>
      </div>
      <Button to={quizshowPlayPath(code)} variant="primary">
        {t("quizshow:event.banner.cta")}
      </Button>
    </section>
  );
}
