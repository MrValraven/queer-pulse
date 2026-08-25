import { useState } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SafetyIcon } from "./SafetyIcon";
import { SCAM_SAFETY_TIPS } from "./housingSafety.data";
import styles from "./HousingSafety.module.css";

interface ScamSafetyBannerProps {
  /**
   * How many tips to show inline (the rest live on the full rights page).
   * Defaults to all of them — pass a smaller number inside tight modals.
   */
  limit?: number;
  /** Hide the dismiss control where the banner should always stay put. */
  dismissible?: boolean;
}

/**
 * Compact, scannable safety reminder for high-risk housing moments — shown when
 * a member is about to contact a lister or list a space. It never blames or
 * alarms; it names the few things that keep people safe and links to the full
 * tenant-rights guide. Dismissal is local to the mount (no persistence), so it
 * reappears the next time the member opens a risky flow.
 */
export function ScamSafetyBanner({
  limit,
  dismissible = true,
}: ScamSafetyBannerProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const tips =
    typeof limit === "number"
      ? SCAM_SAFETY_TIPS.slice(0, limit)
      : SCAM_SAFETY_TIPS;

  return (
    <aside
      className={styles.banner}
      aria-label={t("economy:housingSafety.banner.ariaLabel")}
    >
      <div className={styles.bannerHead}>
        <p className={styles.bannerEyebrow}>
          {t("economy:housingSafety.banner.eyebrow")}
        </p>
        {dismissible && (
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => setDismissed(true)}
            aria-label={t("economy:housingSafety.banner.dismiss")}
          >
            <FiX size={16} aria-hidden />
          </button>
        )}
      </div>

      <h3 className={styles.bannerTitle}>
        <Translation
          i18nKey="economy:housingSafety.banner.title"
          components={{ em: <em /> }}
        />
      </h3>

      <ul className={styles.tipList}>
        {tips.map((tip) => (
          <li key={tip.id} className={styles.tip}>
            <span className={styles.tipIcon}>
              <SafetyIcon name={tip.icon} size={16} />
            </span>
            <span className={styles.tipText}>{t(tip.labelKey)}</span>
          </li>
        ))}
      </ul>

      <Link className={styles.bannerLink} to={routes.tenantRights}>
        {t("economy:housingSafety.banner.moreCta")}
      </Link>
    </aside>
  );
}
