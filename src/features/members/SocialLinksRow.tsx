import { FiEdit3, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SocialLink } from "./data/members";
import {
  socialDisplayLabel,
  socialHref,
  socialPlatform,
} from "./socialLinks.data";
import styles from "./ProfilePage.module.css";

/**
 * Read-mode display of a member's social / web links as tidy chips, shown in the
 * hero beneath the tags. Each resolves to a real link where it can; otherwise it
 * renders as a plain, non-interactive chip (e.g. a Mastodon address).
 *
 * On your own profile (`self`) it also renders a discoverable affordance: an
 * "Add links" chip when you have none, or a trailing "Edit" chip when you do —
 * both call `onEdit` to open the inline editor jumped to the Links section.
 */
export function SocialLinksRow({
  links,
  self = false,
  onEdit,
}: {
  links?: SocialLink[];
  /** True on the viewer's own profile — enables the add/edit affordance. */
  self?: boolean;
  /** Open the inline profile editor at the Links section. */
  onEdit?: () => void;
}) {
  const { t } = useTranslation();
  const items = (links ?? []).filter((l) => l.urlOrHandle.trim());
  // Visitors with an empty list see nothing; on your own profile we always show
  // the row so there's an obvious way to add links.
  if (items.length === 0 && !self) return null;

  return (
    <div className={styles.socialRow}>
      {items.map((link, i) => {
        const meta = socialPlatform(link.platform);
        const Icon = meta.icon;
        const href = socialHref(link.platform, link.urlOrHandle);
        const label = socialDisplayLabel(link.platform, link.urlOrHandle);
        const inner = (
          <>
            <Icon aria-hidden />
            <span>{label}</span>
          </>
        );
        return href ? (
          <a
            key={i}
            href={href}
            className={styles.socialChip}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer noopener"
          >
            {inner}
          </a>
        ) : (
          <span key={i} className={styles.socialChip}>
            {inner}
          </span>
        );
      })}

      {self &&
        (items.length === 0 ? (
          <button
            type="button"
            className={`${styles.socialChip} ${styles.socialChipAdd}`}
            onClick={onEdit}
          >
            <FiPlus aria-hidden /> <span>{t("members:social.addLinks")}</span>
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.socialChip} ${styles.socialChipEdit}`}
            aria-label={t("members:social.editLinksLabel")}
            onClick={onEdit}
          >
            <FiEdit3 aria-hidden /> <span>{t("members:social.editLinks")}</span>
          </button>
        ))}
    </div>
  );
}
