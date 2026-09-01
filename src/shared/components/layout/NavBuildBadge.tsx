import { useTranslation } from "../../i18n/useTranslation";
import styles from "./NavBuildBadge.module.css";

/**
 * The quiet "being built" marker on a nav link whose destination is not
 * launched yet. Set by `filterMenus` via `MegaLink.isBeingBuilt`, drawn by all
 * three link renderers (`MegaNavColumns`, `MegaNavDrawer`, `SidebarGroup`) so
 * the desktop panel, the mobile drawer and the left rail say the same thing.
 *
 * Accessibility: it renders as plain text INSIDE the link, after the label, and
 * is deliberately not hidden from assistive tech and carries no role of its
 * own. So it folds into the link's accessible name in reading order ("Cinema
 * Being built") instead of announcing itself as a separate unlabelled element.
 *
 * It has no colours of its own: text is `inherit` and the pill is mixed from
 * `currentColor`, so it contrasts exactly as well as the label it sits beside
 * on every ground the nav uses (cream mega panel, plum left rail, the cream
 * active row inside that rail) in both themes.
 */
export function NavBuildBadge() {
  const { t } = useTranslation();
  return <span className={styles.badge}>{t("shared:megaNav.beingBuilt")}</span>;
}
