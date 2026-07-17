import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { contractPointKeys } from "./cinemaRights.data";
import styles from "./CinemaRightsPage.module.css";

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function RightsContractCard() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  return (
    <div className={styles.contractCard}>
      <div className={styles.ccInner}>
        <div className={styles.ccEb}>
          {t("cinema:rights.contractCard.eyebrow")}
        </div>
        <div className={styles.ccTitle}>
          <Translation
            i18nKey="cinema:rights.contractCard.title"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.ccPoints}>
          {contractPointKeys.map((key) => (
            <div key={key} className={styles.ccPoint}>
              <Check />
              {t(key)}
            </div>
          ))}
        </div>
        <div className={styles.ccActions}>
          <Button
            onClick={() =>
              showToast(t("cinema:rights.contractCard.downloadToast"), "info")
            }
          >
            {t("cinema:rights.contractCard.downloadCta")}
          </Button>
          <Button variant="ghost-dark" to={routes.cinemaSubmit}>
            {t("cinema:shorts.submitCta.cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
