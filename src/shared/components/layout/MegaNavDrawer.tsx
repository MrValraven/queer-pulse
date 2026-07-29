import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { NAV_MENUS, filterMenus } from "./navMenus";
import { Button } from "../ui";
import { linkToPath } from "../../../app/routeMap";
import { useIsLinkVisible } from "../../../app/authGate";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./MegaNavDrawer.module.css";

interface MegaNavDrawerProps {
  onNavigate: () => void;
}

export function MegaNavDrawer({ onNavigate }: MegaNavDrawerProps) {
  const { t } = useTranslation();
  const isLinkVisible = useIsLinkVisible();
  const menus = filterMenus(NAV_MENUS, isLinkVisible);
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <>
      {menus.map((menu) => {
        const isOpen = openKey === menu.key;
        return (
          <div
            key={menu.key}
            className={[styles.section, isOpen && styles.sectionOpen]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className={styles.sectionButton}
              aria-expanded={isOpen}
              onClick={() => setOpenKey(isOpen ? null : menu.key)}
            >
              {t(menu.titleKey)}
              <span className={styles.sectionChevron} aria-hidden>
                <FiChevronDown />
              </span>
            </button>
            {isOpen && (
              <div className={styles.panel}>
                {menu.columns.map((column) => (
                  <div key={column.headKey}>
                    <div className={styles.colHead}>{t(column.headKey)}</div>
                    {column.links.map((link) => (
                      <Link
                        key={link.labelKey}
                        to={linkToPath(link.href)}
                        // Overwrites the history entry MobileNavDrawer's
                        // provider pushed for the Back gesture instead of
                        // stacking on it. Only ever rendered inside that
                        // drawer, so this is always the right call.
                        replace
                        className={[
                          styles.link,
                          link.featured && styles.linkFeatured,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={onNavigate}
                      >
                        {t(link.labelKey)}
                      </Link>
                    ))}
                    {column.cta && (
                      <Button
                        to={linkToPath(column.cta.href)}
                        replace
                        className={styles.cta}
                        onClick={onNavigate}
                      >
                        {t(column.cta.labelKey)}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
