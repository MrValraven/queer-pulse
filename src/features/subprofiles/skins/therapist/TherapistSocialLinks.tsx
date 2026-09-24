import { useId } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { safeHref } from "../../../../shared/lib/safeHref";
import {
  socialDisplayLabel,
  socialHref,
  socialPlatform,
} from "../../../../shared/social/socialPlatforms";
import type { SocialLinkDTO } from "../../api/subprofiles.api";
import type { PersonaViewMode } from "../../personaSkinRender";
import { TherapistEditLink } from "./TherapistEditLink";
import type { TherapistEditTarget } from "./therapistEditLinks.data";
import sidebarStyles from "./TherapistSidebar.module.css";
import styles from "./TherapistSocialLinks.module.css";

const SOCIAL_EDIT: TherapistEditTarget = {
  pane: "presence",
  field: "socialLinks",
};

interface TherapistSocialLinksProps {
  links: SocialLinkDTO[];
  name: string;
  mode: PersonaViewMode;
}

function SocialLinkRow({
  link,
  isLive,
}: {
  link: SocialLinkDTO;
  isLive: boolean;
}) {
  const platform = socialPlatform(link.platform);
  const Icon = platform.icon;
  const value = socialDisplayLabel(link.platform, link.urlOrHandle);
  const href = safeHref(socialHref(link.platform, link.urlOrHandle));
  const content = (
    <>
      <Icon aria-hidden className={styles.icon} />
      <span className={styles.platform}>{platform.label}</span>
      <span className={styles.value}>{value}</span>
    </>
  );
  // A value that can never be a link reads as plain text; a real link
  // outside `public` is dimmed like the inert contact buttons.
  if (!href || !isLive) {
    const className = href ? `${styles.row} ${styles.inertRow}` : styles.row;
    return <span className={className}>{content}</span>;
  }
  const isMail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      className={`${styles.row} ${styles.liveRow}`}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
    >
      {content}
    </a>
  );
}

/**
 * The persona's social links (edited in the editor's Presence pane) as a
 * small sidebar card of labelled icon rows. Live links in `public` only:
 * `visitor`, `owner` and `preview` show the same rows as plain text, and a
 * value that cannot be a link (a Mastodon address) always reads as text.
 * Renders nothing without links, except for the owner, who gets a quiet
 * "Add your links" edit link instead.
 */
export function TherapistSocialLinks({
  links,
  name,
  mode,
}: TherapistSocialLinksProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const items = links.filter((link) => link.urlOrHandle.trim());
  const isOwner = mode === "owner";
  if (items.length === 0 && !isOwner) return null;

  return (
    <section className={sidebarStyles.card} aria-labelledby={headingId}>
      <div className={sidebarStyles.headRow}>
        <h2 id={headingId} className={sidebarStyles.label}>
          {t("subprofiles:therapist.side.social.label", { name })}
        </h2>
        {items.length > 0 && (
          <TherapistEditLink
            target={SOCIAL_EDIT}
            ariaLabel={t("subprofiles:therapist.side.edit.socialLinks")}
          />
        )}
      </div>
      {items.length > 0 ? (
        <ul className={styles.list}>
          {items.map((link, index) => (
            <li key={`${link.platform}-${index}`}>
              <SocialLinkRow link={link} isLive={mode === "public"} />
            </li>
          ))}
        </ul>
      ) : (
        <TherapistEditLink
          target={SOCIAL_EDIT}
          label={t("subprofiles:therapist.side.social.add")}
        />
      )}
    </section>
  );
}
