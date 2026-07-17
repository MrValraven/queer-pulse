import { Link } from "react-router-dom";
import { Button } from "../ui";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useConsent } from "../../../app/providers/ConsentProvider";
import styles from "./Consent.module.css";

/**
 * App-wide consent banner (spec 07). A quiet bottom sheet on cream — never a
 * full-page wall, and the app stays fully usable behind it (necessary cookies
 * need no consent). Reject is exactly as prominent as Accept. Shown only while
 * no choice has been made under the current policy version.
 */
export function ConsentBanner() {
  const { t } = useTranslation();
  const { status, prefsOpen, acceptAll, rejectAll, openPreferences } =
    useConsent();
  // Hide the banner while the preference center is open, so the bottom sheet
  // doesn't overlap the modal.
  if (status !== "unknown" || prefsOpen) return null;

  return (
    <div
      className={styles.banner}
      role="region"
      aria-label={t("shared:consent.banner.ariaLabel")}
    >
      <div className={styles.bannerInner}>
        <div className={styles.bannerText}>
          <h2 className={styles.bannerTitle}>
            <Translation
              i18nKey="shared:consent.banner.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.bannerBody}>
            <Translation
              i18nKey="shared:consent.banner.body"
              components={{
                a: <Link to={routes.privacy} className={styles.bannerLink} />,
              }}
            />
          </p>
        </div>
        <div className={styles.bannerActions}>
          <Button variant="ghost" onClick={() => rejectAll("banner")}>
            {t("shared:consent.actions.rejectNonEssential")}
          </Button>
          <Button variant="ghost" onClick={openPreferences}>
            {t("shared:consent.actions.choose")}
          </Button>
          <Button variant="primary" onClick={() => acceptAll("banner")}>
            {t("shared:consent.actions.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
