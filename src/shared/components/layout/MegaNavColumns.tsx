import { Link } from "react-router-dom";
import { Button } from "../ui";
import { linkToPath } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import type { MegaMenu } from "./navMenus";
import styles from "./MegaNav.module.css";

/**
 * Middle area of the mega panel: the active section's link columns (uppercase
 * heading + links, plus the optional `<Button>` cta). Remounted per section via
 * a `key` on the call site so it re-runs its fade/slide on section change.
 */
export function MegaNavColumns({
  activeMenu,
  onClose,
}: {
  activeMenu: MegaMenu;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.columns}>
      {activeMenu.columns.map((column) => (
        <div className={styles.col} key={column.headKey}>
          <div className={styles.colHead}>{t(column.headKey)}</div>
          {column.links.map((link) => (
            <Link
              key={link.labelKey}
              to={linkToPath(link.href)}
              className={[styles.link, link.featured && styles.linkFeatured]
                .filter(Boolean)
                .join(" ")}
              onClick={onClose}
            >
              {t(link.labelKey)}
            </Link>
          ))}
          {column.cta && (
            <Button
              to={linkToPath(column.cta.href)}
              className={styles.cta}
              onClick={onClose}
            >
              {t(column.cta.labelKey)}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
