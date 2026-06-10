import { useState } from "react";
import { Link } from "react-router-dom";
import { NAV_MENUS } from "./navMenus";
import { linkToPath } from "../../../app/routeMap";
import styles from "./MegaNavDrawer.module.css";

interface MegaNavDrawerProps {
  onNavigate: () => void;
}

export function MegaNavDrawer({ onNavigate }: MegaNavDrawerProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <>
      {NAV_MENUS.map((menu) => {
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
              {menu.key}
              <span className={styles.sectionChevron} aria-hidden>
                ▾
              </span>
            </button>
            {isOpen && (
              <div className={styles.panel}>
                {menu.columns.map((column) => (
                  <div key={column.head}>
                    <div className={styles.colHead}>{column.head}</div>
                    {column.links.map((link) => (
                      <Link
                        key={link.label}
                        to={linkToPath(link.href)}
                        className={[
                          styles.link,
                          link.featured && styles.linkFeatured,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={onNavigate}
                      >
                        {link.label}
                      </Link>
                    ))}
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
