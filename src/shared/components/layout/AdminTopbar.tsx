import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { FiBell, FiMenu, FiMoon, FiSearch, FiSun } from "react-icons/fi";
import { useTheme } from "../../../app/providers/themeContext";
import { useTranslation } from "../../i18n/useTranslation";
import { Button, IconButton } from "../ui";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import {
  AdminAlertsPopover,
  useAdminAlertsSummary,
} from "./AdminAlertsPopover";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { useAdminCommandPalette } from "./useAdminCommandPalette";
import { useAdminNavBadgeStatus } from "./useAdminNavBadges";
import styles from "./AdminShell.module.css";

export interface AdminCrumb {
  label: string;
  to?: string;
}

/** Cmd on Apple keyboards, Ctrl everywhere else, for the key hint. */
function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

function isPaletteShortcut(event: KeyboardEvent): boolean {
  return (
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "k"
  );
}

/**
 * Cmd/Ctrl+K while the alerts popover is up: close it and park focus on the
 * bell first. A capture listener on `window` runs ahead of the palette hook's
 * own listener, so the palette records the bell as the place Esc returns to,
 * and one Esc never lands on both layers.
 */
function useCloseAlertsOnShortcut(
  isAlertsOpen: boolean,
  closeAlerts: () => void,
  bellRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!isAlertsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPaletteShortcut(event)) return;
      closeAlerts();
      bellRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [isAlertsOpen, closeAlerts, bellRef]);
}

/**
 * The admin console's top bar: the drawer toggle on a phone, the breadcrumb,
 * the "Jump to a page" trigger for the Cmd/Ctrl+K palette, and the theme and
 * alerts controls. It owns the palette and the alerts popover, which never
 * show together.
 */
export function AdminTopbar({
  barRef,
  title,
  breadcrumb,
  isMobile,
  drawerId,
  isDrawerOpen,
  onToggleDrawer,
}: {
  barRef: RefObject<HTMLElement | null>;
  title: ReactNode;
  breadcrumb: AdminCrumb[];
  isMobile: boolean;
  drawerId: string;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const palette = useAdminCommandPalette();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const closeAlerts = useCallback(() => setIsAlertsOpen(false), []);
  useCloseAlertsOnShortcut(isAlertsOpen, closeAlerts, bellRef);
  // The palette is a modal and wins: whatever opened it, the popover goes.
  if (palette.isOpen && isAlertsOpen) setIsAlertsOpen(false);

  const { unavailable } = useAdminNavBadgeStatus();
  const { total } = useAdminAlertsSummary(unavailable);
  const themeLabel = t("shared:adminShell.toggleTheme");
  // The dot is silent, so the bell's name carries the count.
  const alertsLabel =
    total > 0
      ? t("shared:adminShell.alertsWaiting", { count: total })
      : t("shared:adminShell.alerts");

  return (
    <header ref={barRef} className={styles.topbar}>
      {isMobile && (
        <IconButton
          className={styles.barIconBtn}
          aria-label={isDrawerOpen ? t("nav:closeMenu") : t("nav:openMenu")}
          aria-expanded={isDrawerOpen}
          aria-controls={drawerId}
          onClick={onToggleDrawer}
        >
          <FiMenu aria-hidden />
        </IconButton>
      )}

      <AdminBreadcrumb title={title} breadcrumb={breadcrumb} />

      <PaletteTrigger isCompact={isMobile} onOpen={palette.open} />

      <div className={styles.topRight}>
        <IconButton
          className={styles.barIconBtn}
          onClick={toggleTheme}
          aria-label={themeLabel}
          tooltip
          tooltipPlacement="bottom"
        >
          {theme === "dark" ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
        </IconButton>
        <IconButton
          ref={bellRef}
          className={styles.barIconBtn}
          onClick={() => setIsAlertsOpen((open) => !open)}
          aria-label={alertsLabel}
          aria-haspopup="dialog"
          aria-expanded={isAlertsOpen}
          tooltip
          tooltipPlacement="bottom"
          isTooltipDisabled={isAlertsOpen}
        >
          <FiBell aria-hidden />
          {total > 0 && (
            <span className={styles.bellDot} data-alert-dot aria-hidden />
          )}
        </IconButton>
      </div>

      <AdminAlertsPopover
        anchorRef={bellRef}
        isOpen={isAlertsOpen}
        onClose={closeAlerts}
        unavailable={unavailable}
      />
      <AdminCommandPalette isOpen={palette.isOpen} onClose={palette.close} />
    </header>
  );
}

/** The palette's visible entry point: a field-shaped button with the key hint
 *  on a wide screen, the search icon alone below 900px. */
function PaletteTrigger({
  isCompact,
  onOpen,
}: {
  isCompact: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const label = t("shared:adminShell.palette.trigger");
  const isApple = isApplePlatform();
  const shortcut = isApple ? "Meta+K" : "Control+K";

  if (isCompact) {
    return (
      <IconButton
        className={styles.barIconBtn}
        aria-label={label}
        aria-haspopup="dialog"
        aria-keyshortcuts={shortcut}
        onClick={onOpen}
      >
        <FiSearch aria-hidden />
      </IconButton>
    );
  }
  return (
    <Button
      variant="ghost"
      className={styles.paletteTrigger}
      aria-haspopup="dialog"
      aria-keyshortcuts={shortcut}
      onClick={onOpen}
    >
      <FiSearch className={styles.triggerIcon} aria-hidden />
      <span className={styles.triggerLabel}>{label}</span>
      <kbd className={styles.triggerKbd} aria-hidden>
        {isApple
          ? t("shared:adminShell.palette.hintMac")
          : t("shared:adminShell.palette.hintOther")}
      </kbd>
    </Button>
  );
}
