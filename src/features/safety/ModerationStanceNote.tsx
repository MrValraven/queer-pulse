import { FiCompass } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  MODERATION_STANCE_HEAD,
  MODERATION_STANCE_LINKS,
  MODERATION_STANCE_RULES,
  type ModerationStanceVariant,
} from "./moderationStance.data";
import styles from "./ModerationStanceNote.module.css";

/**
 * The standing "how we read these" note above a moderation queue. Rendered by
 * the community mod console, the platform staff report and appeal queues, and
 * the join-request queue, so every moderator reaches the same answer on the
 * same case. `variant` picks the rule set for the decision being made.
 *
 * Deliberately not dismissible: the whole point is that it is in front of
 * whoever is deciding, every time.
 */
export function ModerationStanceNote({
  variant = "reports",
}: {
  variant?: ModerationStanceVariant;
} = {}) {
  const { t } = useTranslation();
  const headingId = `moderation-stance-${variant}`;

  return (
    <aside className={styles.note} aria-labelledby={headingId}>
      <div className={styles.head} id={headingId}>
        <FiCompass className={styles.icon} aria-hidden />
        {t(MODERATION_STANCE_HEAD[variant])}
      </div>
      <ul className={styles.rules}>
        {MODERATION_STANCE_RULES[variant].map((key) => (
          <li key={key} className={styles.rule}>
            <span className={styles.bullet} aria-hidden />
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.links}>
        {MODERATION_STANCE_LINKS.map((link) => (
          <Link key={link.href} className={styles.link} to={link.href}>
            {t(link.labelKey)}
          </Link>
        ))}
      </div>
    </aside>
  );
}
