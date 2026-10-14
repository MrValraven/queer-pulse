import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { socialPlatform } from "../../shared/social/socialPlatforms";
import type { StudioExternalLinkView } from "./api/studio.adapters";
import styles from "./StudioSupport.module.css";

/** Outbound links (support, social) as rows: platform icon, platform name,
 *  handle, and the new-tab cue. A value that cannot be a link reads as
 *  text. Nothing counts a click. */
export function StudioExternalLinkList({
  links,
  label,
}: {
  links: StudioExternalLinkView[];
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <ul className={styles.list} aria-label={label}>
      {links.map((link, index) => {
        const Icon = socialPlatform(link.platform).icon;
        const body = (
          <>
            <Icon aria-hidden className={styles.platformIcon} />
            <span className={styles.linkText}>
              <span className={styles.platform}>{link.platformLabel}</span>
              <span className={styles.handle} title={link.handleLabel}>
                {link.handleLabel}
              </span>
            </span>
          </>
        );
        return (
          <li key={`${link.platform}-${link.handleLabel}-${index}`}>
            {link.href?.startsWith("mailto:") ? (
              <a className={styles.link} href={link.href}>
                {body}
              </a>
            ) : link.href ? (
              <a
                className={styles.link}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {body}
                <FiExternalLink aria-hidden className={styles.external} />
                <span className="visuallyHidden">
                  {t("studio:support.opensInNewTab")}
                </span>
              </a>
            ) : (
              <span className={styles.link}>{body}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
