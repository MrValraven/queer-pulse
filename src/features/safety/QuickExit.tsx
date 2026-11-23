import { useEffect } from "react";
import { FiExternalLink, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useQuickExit } from "./useQuickExit";
import styles from "./QuickExit.module.css";

/**
 * Fixed, thumb-zone "quick exit" for at-risk visitors on high-stakes safety
 * pages. Signs the member out, wipes this device and leaves at once for a
 * neutral site (see `useQuickExit`). Also triggered by the Escape key, a
 * well-known safety pattern. Every route is reachable by a visible control,
 * so this is an addition and never the only way out. Signed-in members also
 * reach Quick Exit from the account menu on every page
 * ({@link QuickExitMenuItem}).
 */
export function QuickExit() {
  const { t } = useTranslation();
  const leaveNow = useQuickExit();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // An Escape something else already handled (a menu, a popover) or one
      // that ends an IME composition is that control's, and while a dialog is
      // open Escape closes the dialog.
      if (event.defaultPrevented || event.isComposing) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      // Don't bail on an accidental Escape while the user is typing (drafting
      // a report, say): that would discard their input. The visible button
      // stays the always-instant exit.
      const active = document.activeElement;
      const isTextEntry =
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable);
      if (isTextEntry) return;
      leaveNow();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leaveNow]);

  return (
    <button
      type="button"
      className={styles.quickExit}
      onClick={leaveNow}
      aria-label={t("nav:quickExitAria")}
    >
      <FiX aria-hidden />
      <span>{t("nav:quickExitLabel")}</span>
    </button>
  );
}

/**
 * The Quick Exit row in the account menu and the mobile account sheet, so a
 * signed-in member reaches it from every page (feed, messages, profiles). It
 * runs the same action as the safety pages' button. The host passes its own
 * row classes so the row matches the menu around it.
 */
export function QuickExitMenuItem({
  className,
  iconClassName,
  labelClassName,
}: {
  className: string;
  /** CSS-module class lookups, typed `string | undefined` by the project. */
  iconClassName: string | undefined;
  labelClassName: string | undefined;
}) {
  const { t } = useTranslation();
  const leaveNow = useQuickExit();
  return (
    <button
      type="button"
      className={className}
      onClick={leaveNow}
      aria-label={t("nav:quickExitAria")}
    >
      <FiExternalLink aria-hidden className={iconClassName} />
      <span className={labelClassName}>{t("nav:quickExitLabel")}</span>
    </button>
  );
}
