import type { AccentKey, SocialLinkDTO } from "./api/subprofiles.api";
import {
  socialDisplayLabel,
  socialHref,
  socialPlatform,
} from "../../shared/social/socialPlatforms";
import { accentTintStyle } from "./subprofilePresence.data";
import styles from "./SubprofileSocialRow.module.css";

/**
 * Compact icon row for a persona's social links, shown in the public hero.
 * Each link resolves to a real `href` where it can; when it can't (e.g. a
 * Mastodon "@you@instance" address), it renders as a plain, non-interactive
 * icon rather than a broken link. Icons tint with the persona's accent on
 * hover/focus. Renders nothing when there are no usable links.
 *
 * `interactive` defaults to `true`; the Phase-3 editor's docked preview
 * passes `false` (`mode="preview"`) so every icon falls back to the same
 * non-navigating look-alike already used for un-resolvable links — a click
 * inside the preview must never open a real social profile in a new tab.
 */
export function SubprofileSocialRow({
  links,
  accent,
  interactive = true,
}: {
  links: SocialLinkDTO[];
  accent: AccentKey;
  interactive?: boolean;
}) {
  const items = links.filter((link) => link.urlOrHandle.trim());
  if (items.length === 0) return null;

  return (
    <div
      className={`${styles.row} pp-social-row`}
      style={accentTintStyle(accent)}
    >
      {items.map((link, index) => {
        const meta = socialPlatform(link.platform);
        const Icon = meta.icon;
        const href = interactive
          ? socialHref(link.platform, link.urlOrHandle)
          : null;
        const label = socialDisplayLabel(link.platform, link.urlOrHandle);
        const title = `${meta.label} · ${label}`;
        const key = `${link.platform}-${index}`;

        if (!href) {
          return (
            <span
              key={key}
              className={`${styles.iconLink} ${styles.iconStatic}`}
              aria-label={title}
              title={title}
            >
              <Icon aria-hidden />
            </span>
          );
        }

        return (
          <a
            key={key}
            href={href}
            className={styles.iconLink}
            aria-label={title}
            title={title}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer noopener"
          >
            <Icon aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
