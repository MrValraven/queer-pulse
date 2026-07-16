import { useSkipLinkPref } from "../../../features/settings/skipLinkPref";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./SkipToContentLink.module.css";

/** The `id` on `<main>` that both shells render and this link targets. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * "Skip to main content" — the first thing in the tab order, hidden until it
 * takes focus, jumping past the nav straight to `<main>`.
 *
 * Rendered only when the member has turned the pref on (Settings →
 * Accessibility → Interaction → "Skip to content link"). Until now that toggle
 * flipped a boolean no render code read and no such link existed anywhere, so
 * the control described a feature the app didn't have.
 *
 * `href` (not `<Link>`) is deliberate: this is a same-document fragment jump,
 * and letting the router intercept it would push a history entry and move focus
 * nowhere. A plain anchor is what moves both focus and the scroll position.
 */
export function SkipToContentLink() {
  const enabled = useSkipLinkPref();
  const { t } = useTranslation();
  if (!enabled) return null;

  return (
    <a className={styles.link} href={`#${MAIN_CONTENT_ID}`}>
      {t("shared:skipToContent.label")}
    </a>
  );
}
