import { useTranslation } from "../../../shared/i18n/useTranslation";
import { leadLinkPlatform } from "./leadLinkPlatform";
import styles from "./LeadParts.module.css";

/**
 * A lead's links as a row of platform icons, one per link shown. The icons
 * are decorative: a visually hidden line names the platforms in order, and
 * when the lead holds more links than the row shows, a "+N" follows with
 * its own spoken count. A lead with no links draws nothing.
 */
export function LeadLinkIcons({
  links,
  linkCount,
}: {
  links: readonly string[];
  linkCount: number;
}) {
  const { t } = useTranslation();
  if (links.length === 0 && linkCount === 0) return null;
  const platforms = links.map((link) => ({
    link,
    platform: leadLinkPlatform(link),
  }));
  const platformNames = platforms
    .map(({ platform }) => t(platform.labelKey))
    .join(", ");
  const hiddenLinkCount = Math.max(linkCount - links.length, 0);

  return (
    <span className={styles.linkIcons}>
      {platforms.map(({ link, platform }) => {
        const PlatformIcon = platform.icon;
        return (
          <PlatformIcon key={link} className={styles.linkIcon} aria-hidden />
        );
      })}
      <span className="visuallyHidden">
        {t("admin:leads.list.linksLabel", { platforms: platformNames })}
      </span>
      {hiddenLinkCount > 0 ? (
        <>
          <span className={styles.moreLinks} aria-hidden>
            +{hiddenLinkCount}
          </span>
          <span className="visuallyHidden">
            {t("admin:leads.list.moreLinksAria", { count: hiddenLinkCount })}
          </span>
        </>
      ) : null}
    </span>
  );
}
