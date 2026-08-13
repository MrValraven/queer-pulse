import { FiHeart } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AffirmingBaseline.module.css";

/**
 * The universal "LGBTQ+ affirming space" badge shown on every housing listing
 * card and detail. It is a NORM statement — every home and housemate here is
 * affirming by baseline — never a per-listing variable attribute. This replaces
 * the old optional `lgbtqFriendly` fact.
 */
export function AffirmingBaselineBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={[styles.badge, className].filter(Boolean).join(" ")}
      title={t("economy:affirmingBaseline.badgeTooltip")}
    >
      <FiHeart aria-hidden className={styles.badgeIcon} />
      {t("economy:affirmingBaseline.badge")}
    </span>
  );
}

/**
 * One-line baseline norm statement for the housing home / board header:
 * "Every home and housemate here is LGBTQ+ affirming — that's the standard."
 */
export function AffirmingBaselineNote({ className }: { className?: string }) {
  return (
    <div className={[styles.note, className].filter(Boolean).join(" ")}>
      <FiHeart aria-hidden className={styles.noteIcon} />
      <span className={styles.noteText}>
        <Translation
          i18nKey="economy:affirmingBaseline.note"
          components={{ em: <em /> }}
        />
      </span>
    </div>
  );
}
