import { useSkipLinkPref } from "../../../features/settings/skipLinkPref";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./SkipToContentLink.module.css";

/** The `id` on `<main>` that both shells render and this link targets. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * "Skip to main content" — the first thing in the tab order, hidden until it
 * takes focus, jumping past the nav straight to `<main>`.
 *
 * Rendered by default for everyone: bypassing blocks is WCAG 2.4.1, a baseline
 * conformance requirement rather than a preference, and a keyboard user can't
 * be asked to walk through the nav they can't bypass to switch it on. The
 * pref (Settings → Accessibility → Interaction → "Skip to content link")
 * survives as an opt-*out* only.
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
