import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./QuickExit.module.css";

const SAFE_DESTINATION = "https://www.google.com";

/**
 * Fixed, thumb-zone "quick exit" for at-risk visitors on high-stakes safety
 * pages. Navigates away immediately with location.replace (no history entry,
 * so the Back button can't return here) to a neutral site. Also triggered by
 * the Escape key — a well-known safety pattern. Every route is reachable by a
 * visible control, so this is an addition, never the only way out.
 */
function leaveNow() {
  window.location.replace(SAFE_DESTINATION);
}

export function QuickExit() {
  const { t } = useTranslation();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Don't bail on an accidental Escape while the user is typing (e.g.
      // drafting a report) — that would discard their input. The visible button
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
  }, []);

  return (
    <button
      type="button"
      className={styles.quickExit}
      onClick={leaveNow}
      aria-label={t("safety:quickExit.aria")}
    >
      <FiX aria-hidden />
      <span>{t("safety:quickExit.label")}</span>
    </button>
  );
}
