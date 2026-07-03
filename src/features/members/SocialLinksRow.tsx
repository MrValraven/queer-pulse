import type { SocialLink } from "./data/members";
import { socialHref, socialPlatform } from "./socialLinks.data";
import styles from "./ProfilePage.module.css";

/**
 * Read-mode display of a member's social / web links as tidy chips, shown in the
 * hero beneath the tags. Each resolves to a real link where it can; otherwise it
 * renders as a plain, non-interactive chip (e.g. a Mastodon address).
 */
export function SocialLinksRow({ links }: { links?: SocialLink[] }) {
  const items = (links ?? []).filter((l) => l.urlOrHandle.trim());
  if (items.length === 0) return null;

  return (
    <div className={styles.socialRow}>
      {items.map((link, i) => {
        const meta = socialPlatform(link.platform);
        const Icon = meta.icon;
        const href = socialHref(link.platform, link.urlOrHandle);
        const label = link.urlOrHandle.trim();
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
    </div>
  );
}
