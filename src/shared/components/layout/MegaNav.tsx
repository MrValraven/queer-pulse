import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { NAV_MENUS } from "./navMenus";
import { linkToPath } from "../../../app/routeMap";
import styles from "./MegaNav.module.css";

export function MegaNav() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [nudgeX, setNudgeX] = useState(0);
  const [direction, setDirection] = useState(0);
  const itemsRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number | undefined>(undefined);

  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const openMenu = (key: string) => {
    cancelClose();
    setOpenKey((current) => {
      if (current === key) return current;
      if (current === null) {
        const row = itemsRef.current;
        const btn = buttonRefs.current[key];
        if (row && btn) {
          const rowRect = row.getBoundingClientRect();
          const btnRect = btn.getBoundingClientRect();
          const rowCx = rowRect.left + rowRect.width / 2;
          const btnCx = btnRect.left + btnRect.width / 2;
          setNudgeX((btnCx - rowCx) * 0.22);
        }
        setDirection(0);
      } else {
        const currentIdx = NAV_MENUS.findIndex((m) => m.key === current);
        const nextIdx = NAV_MENUS.findIndex((m) => m.key === key);
        setDirection(nextIdx > currentIdx ? 1 : -1);
      }
      return key;
    });
  };

  const closeMenu = () => {
    cancelClose();
    setOpenKey(null);
  };

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpenKey(null), 110);
  };

  const toggleMenu = (key: string) => {
    if (openKey === key) closeMenu();
    else openMenu(key);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeMenu = NAV_MENUS.find((menu) => menu.key === openKey) ?? null;
  const enterX = direction > 0 ? "26px" : direction < 0 ? "-26px" : "0px";

  return (
    <>
      <div className={styles.items} ref={itemsRef}>
        {NAV_MENUS.map((menu) => (
          <button
            key={menu.key}
            type="button"
            ref={(el) => {
              buttonRefs.current[menu.key] = el;
            }}
            className={[styles.button, openKey === menu.key && styles.buttonOpen]
              .filter(Boolean)
              .join(" ")}
            aria-expanded={openKey === menu.key}
            onMouseEnter={() => openMenu(menu.key)}
            onMouseLeave={scheduleClose}
            onClick={() => toggleMenu(menu.key)}
          >
            {menu.key}
            <span className={styles.chevron} aria-hidden>
              ▾
            </span>
          </button>
        ))}
      </div>

      {activeMenu &&
        createPortal(
          <>
            <div className={styles.overlay} onClick={closeMenu} />
            <div
              className={styles.panel}
              style={{ "--nudge-x": `${nudgeX}px` } as CSSProperties}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div
                key={activeMenu.key}
                className={styles.inner}
                style={{ "--enter-x": enterX } as CSSProperties}
              >
                {activeMenu.columns.map((column) => (
                  <div className={styles.col} key={column.head}>
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
                        onClick={closeMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
