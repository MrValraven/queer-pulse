import { useState } from "react";
import { FiCompass } from "react-icons/fi";
import { ReferenceDigestModal } from "../../shared/components/ui";
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
 * whoever is deciding, every time. Its two references open a digest dialog
 * rather than navigating, for the same reason: a moderator halfway through a
 * report or an application should not have to leave it to check the rule.
 */
export function ModerationStanceNote({
  variant = "reports",
}: {
  variant?: ModerationStanceVariant;
} = {}) {
  const { t } = useTranslation();
  const [openDigestIndex, setOpenDigestIndex] = useState<number | null>(null);
  const headingId = `moderation-stance-${variant}`;
  const openDigest =
    openDigestIndex === null ? null : MODERATION_STANCE_LINKS[openDigestIndex];

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
        {MODERATION_STANCE_LINKS.map((link, index) => (
          <button
            key={link.labelKey}
            type="button"
            className={styles.link}
            onClick={() => setOpenDigestIndex(index)}
          >
            {t(link.labelKey)}
          </button>
        ))}
      </div>
      {openDigest && (
        <ReferenceDigestModal
          topic={openDigest.topic}
          onClose={() => setOpenDigestIndex(null)}
        />
      )}
    </aside>
  );
}
