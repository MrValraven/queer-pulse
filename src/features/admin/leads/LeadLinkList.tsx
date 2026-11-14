import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { leadLinkKey } from "./api/leadLinkKey";
import { leadLinkAddressOf, leadLinkPlatform } from "./leadLinkPlatform";
import styles from "./LeadDetails.module.css";

/** One stored link: the platform's icon and name over the address. A web
 *  link opens in a new tab and says so to a screen reader; text that is no
 *  web link reads as plain text. */
function LeadLinkItem({ link }: { link: string }) {
  const { t } = useTranslation();
  const platform = leadLinkPlatform(link);
  const PlatformIcon = platform.icon;
  const isWebLink = leadLinkKey(link) !== null;
  const content = (
    <>
      <PlatformIcon className={styles.linkPlatformIcon} aria-hidden />
      <span className={styles.linkText}>
        <span className={styles.linkPlatform}>{t(platform.labelKey)}</span>{" "}
        <span className={styles.linkAddress}>{leadLinkAddressOf(link)}</span>
      </span>
    </>
  );

  return (
    <li className={styles.linkItem}>
      {isWebLink ? (
        <a
          href={link.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkRow}
        >
          {content}
          <FiExternalLink className={styles.linkOpenIcon} aria-hidden />
          <span className="visuallyHidden">
            {" "}
            {t("admin:leads.details.opensInNewTab")}
          </span>
        </a>
      ) : (
        <span className={styles.linkRow}>{content}</span>
      )}
    </li>
  );
}

/** The lead's links, one row each, in stored order. */
export function LeadLinkList({ links }: { links: readonly string[] }) {
  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <LeadLinkItem key={link} link={link} />
      ))}
    </ul>
  );
}
