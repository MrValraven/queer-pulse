import { useCallback, useState } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import { useQuickExit } from "../../hooks/useQuickExit";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import styles from "./QuickExit.module.css";

const SEEN_KEY = "qp.safety.quickExit.seen.v1";

/**
 * Persistent, site-wide safety escape. Mount ONCE at the app root (a sibling of
 * CommandPalette) so it covers every route — both shells and the ~40 no-shell
 * pages. Clicking the button, or the double-Shift accelerator (see
 * useQuickExit), sends the tab to a neutral decoy site. Honest about limits: it
 * is a fast screen-clear, not anonymity — earlier history/bookmarks can't be
 * wiped by any web app.
 */
export function QuickExit() {
  const { enabled, keyTrigger, triggerExit } = useQuickExit();
  const prefersReduced = usePrefersReducedMotion();
  const [seen, setSeen] = useLocalStorage<boolean>(SEEN_KEY, false);
  const [showAbout, setShowAbout] = useState(false);

  const dismissTip = useCallback(() => setSeen(true), [setSeen]);

  const onExit = useCallback(() => {
    setSeen(true); // interacting counts as "seen"
    triggerExit();
  }, [setSeen, triggerExit]);

  if (!enabled) return null;

  const showTip = !seen;

  return (
    <div className={styles.root} data-reduced={prefersReduced ? "" : undefined}>
      {showTip && (
        <div className={styles.tooltip} role="status">
          <p className={styles.tooltipText}>
            <strong>Need to leave fast?</strong> This button
            {keyTrigger ? " — or tapping Shift twice — " : " "}
            sends you to a weather page.
          </p>
          <button
            type="button"
            className={styles.tooltipClose}
            onClick={dismissTip}
            aria-label="Dismiss Quick exit tip"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      {showAbout && (
        <div
          className={styles.about}
          role="dialog"
          aria-label="About Quick exit"
        >
          <p className={styles.aboutText}>
            Quick exit sends this tab to a weather page and reopens QueerPulse
            in a separate tab. It’s a fast screen-clear, not anonymity: it can’t
            wipe your earlier browser history, bookmarks, or address-bar
            suggestions. For real safety, also use a private window and clear
            your history.
          </p>
          <button
            type="button"
            className={styles.aboutClose}
            onClick={() => setShowAbout(false)}
          >
            Got it
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={onExit}
          aria-label="Quick exit — leave this site now"
          aria-keyshortcuts={keyTrigger ? "Shift Shift" : undefined}
        >
          <FiLogOut aria-hidden="true" className={styles.icon} />
          <span className={styles.label}>Quick exit</span>
          {keyTrigger && (
            <span className={styles.visuallyHidden}>
              Shortcut: press Shift twice
            </span>
          )}
        </button>
        <button
          type="button"
          className={styles.info}
          onClick={() => setShowAbout((v) => !v)}
          aria-expanded={showAbout}
          aria-label="About Quick exit and its limits"
        >
          <span aria-hidden="true">?</span>
        </button>
      </div>
    </div>
  );
}
