import { FiCheckCircle, FiPhone } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VerificationLevel } from "./api/verification.api";
import styles from "./VerificationBadge.module.css";

/**
 * Honest verification chip. It renders ONLY for a level backed by a real
 * verification event — `id_verified` and `phone`. `email`/`none` render nothing:
 * having an account is not an achievement worth a badge, and showing one would
 * be the exact decorative-badge overclaim this feature exists to avoid.
 *
 * The tooltip states plainly what the badge means AND what it does not (e.g.
 * "phone confirmed" is not "identity confirmed"), so a badge never implies more
 * assurance than was actually established.
 */
export function VerificationBadge({
  level,
  size = "md",
}: {
  level: VerificationLevel;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation();
  if (level !== "phone" && level !== "id_verified") return null;

  const isId = level === "id_verified";
  const label = isId
    ? t("economy:verification.badge.id.label")
    : t("economy:verification.badge.phone.label");
  const tooltip = isId
    ? t("economy:verification.badge.id.tooltip")
    : t("economy:verification.badge.phone.tooltip");
  const Icon = isId ? FiCheckCircle : FiPhone;

  return (
    <span
      className={[
        styles.badge,
        isId ? styles.id : styles.phone,
        size === "sm" ? styles.sm : "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={tooltip}
      aria-label={`${label}. ${tooltip}`}
    >
      <Icon aria-hidden className={styles.icon} />
      <span>{label}</span>
    </span>
  );
}
