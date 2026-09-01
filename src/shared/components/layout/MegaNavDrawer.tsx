import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { NAV_MENUS, filterMenus } from "./navMenus";
import { Button } from "../ui";
import { linkToPath } from "../../../app/routeMap";
import { useIsLinkVisible } from "../../../app/authGate";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { NavBuildBadge } from "./NavBuildBadge";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./MegaNavDrawer.module.css";

interface MegaNavDrawerProps {
  onNavigate: () => void;
}

export function MegaNavDrawer({ onNavigate }: MegaNavDrawerProps) {
  const { t } = useTranslation();
  const isLinkVisible = useIsLinkVisible();
  const { demoMode } = useDemoMode();
  const menus = filterMenus(NAV_MENUS, isLinkVisible, demoMode);
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
            {/* Panel stays mounted so the grid-rows 0fr→1fr transition can
                play on open/close (mirrors SidebarGroup). Hidden from a11y
                tree and made inert-ish via aria-hidden when collapsed. */}
            <div
              className={[styles.panel, isOpen && styles.panelOpen]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.panelInner} aria-hidden={!isOpen}>
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
                        tabIndex={isOpen ? undefined : -1}
                      >
                        {t(link.labelKey)}
                        {link.isBeingBuilt && <NavBuildBadge />}
                      </Link>
                    ))}
                    {column.cta && (
                      <Button
                        to={linkToPath(column.cta.href)}
                        replace
                        className={styles.cta}
                        onClick={onNavigate}
                        tabIndex={isOpen ? undefined : -1}
                      >
                        {t(column.cta.labelKey)}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
