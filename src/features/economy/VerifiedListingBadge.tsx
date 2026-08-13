import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./VerifiedListingBadge.module.css";

/**
 * The honest "verified listing" chip (P2.3). It renders ONLY when the backend
 * has derived `verified === true` — a real signal (an ID-verified lister, a
 * listing that passed moderation to live, and a near-clean risk score), never a
 * self-set flag. When the listing hasn't earned it, this renders nothing rather
 * than a reassuring-but-empty badge — the exact overclaim the feature avoids.
 *
 * The tooltip states plainly what the chip means, so it never implies more than
 * the three signals that actually earned it.
 */
export function VerifiedListingBadge({ verified }: { verified?: boolean }) {
  const { t } = useTranslation();
  if (!verified) return null;
  return (
    <span
      className={styles.badge}
      title={t("economy:verifiedListing.tooltip")}
      aria-label={`${t("economy:verifiedListing.label")}. ${t(
        "economy:verifiedListing.tooltip",
      )}`}
    >
      <FiShield aria-hidden className={styles.icon} />
      <span>{t("economy:verifiedListing.label")}</span>
    </span>
  );
}
