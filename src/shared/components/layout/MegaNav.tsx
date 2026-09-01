import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { FiChevronDown } from "react-icons/fi";
import { NAV_MENUS, filterMenus } from "./navMenus";
import { useIsLinkVisible } from "../../../app/authGate";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../i18n/useTranslation";
import { MegaNavPanel } from "./MegaNavPanel";
import styles from "./MegaNav.module.css";

export function MegaNav() {
  const { t } = useTranslation();
  const isLinkVisible = useIsLinkVisible();
  const { demoMode } = useDemoMode();
  const menus = filterMenus(NAV_MENUS, isLinkVisible, demoMode);
  // `openKey` doubles as the panel's active section: which section the rail
  // highlights and the columns/preview render. `null` means the panel is closed.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number | undefined>(undefined);
  // The trigger that opened the menu, so focus can be restored when it closes.
  const triggerKey = useRef<string | null>(null);

  const cancelClose = () => window.clearTimeout(closeTimer.current);

  // Open the panel from a top-bar trigger with THAT section active.
  const openMenu = (key: string) => {
    cancelClose();
    triggerKey.current = key;
    setOpenKey(key);
  };

  // Rail hover/focus/click: swap the active section without closing the panel.
  const selectSection = (key: string) => {
    cancelClose();
    setOpenKey(key);
  };

  const closeMenu = () => {
    cancelClose();
    setOpenKey(null);
  };

  // Close and return focus to the trigger button (keyboard dismissal).
  const closeAndRestore = () => {
    closeMenu();
    const key = triggerKey.current;
    if (key) buttonRefs.current[key]?.focus();
  };

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpenKey(null), 110);
  };

  const toggleMenu = (key: string) => {
    if (openKey === key) closeMenu();
    else openMenu(key);
  };

  const focusButton = (key: string) => buttonRefs.current[key]?.focus();

  const onButtonKeyDown = (event: ReactKeyboardEvent, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + delta + menus.length) % menus.length;
      const nextKey = menus[next]!.key;
      focusButton(nextKey);
      if (openKey) openMenu(nextKey);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(menus[index]!.key);
    } else if (event.key === "Escape" && openKey) {
      event.preventDefault();
      closeAndRestore();
    }
  };

  // Latest-ref so the listener effect re-runs only on openKey (its real trigger),
  // not on every render where closeAndRestore is re-created, without suppressing
  // the deps lint.
  const closeAndRestoreRef = useRef(closeAndRestore);
  useEffect(() => {
    closeAndRestoreRef.current = closeAndRestore;
  });
  useEffect(() => {
    if (!openKey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAndRestoreRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openKey]);

  const activeMenu = menus.find((menu) => menu.key === openKey) ?? null;

  return (
    <>
      <div
        className={styles.items}
        // Close is scheduled only when the cursor leaves the whole trigger row,
        // not when it crosses the gaps BETWEEN names. So an already-open panel
        // stays open while the cursor hovers between two triggers.
        onMouseLeave={scheduleClose}
      >
        {menus.map((menu, index) => (
          <button
            key={menu.key}
            type="button"
            ref={(el) => {
              buttonRefs.current[menu.key] = el;
            }}
            className={[
              styles.button,
              openKey === menu.key && styles.buttonOpen,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-haspopup="true"
            aria-expanded={openKey === menu.key}
            aria-controls={openKey === menu.key ? "mega-panel" : undefined}
            onMouseEnter={() => openMenu(menu.key)}
            onClick={() => toggleMenu(menu.key)}
            onKeyDown={(event) => onButtonKeyDown(event, index)}
          >
            {t(menu.titleKey)}
            <span className={styles.chevron} aria-hidden>
              <FiChevronDown />
            </span>
          </button>
        ))}
      </div>

      {activeMenu && (
        <MegaNavPanel
          menus={menus}
          activeMenu={activeMenu}
          activeKey={activeMenu.key}
          onSelect={selectSection}
          onClose={closeMenu}
          onPanelMouseEnter={cancelClose}
          onPanelMouseLeave={scheduleClose}
        />
      )}
    </>
  );
}
