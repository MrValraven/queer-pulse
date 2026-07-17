import { useCallback, useState } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import { useQuickExit } from "../../hooks/useQuickExit";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useToast } from "../feedback/useToast";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
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
  const { t } = useTranslation();
  const { enabled, keyTrigger, triggerExit, setEnabled } = useQuickExit();
  const prefersReduced = usePrefersReducedMotion();
  const { showToast } = useToast();
  const [seen, setSeen] = useLocalStorage<boolean>(SEEN_KEY, false);
  const [showAbout, setShowAbout] = useState(false);

  const dismissTip = useCallback(() => setSeen(true), [setSeen]);

  const onExit = useCallback(() => {
    setSeen(true); // interacting counts as "seen"
    triggerExit();
  }, [setSeen, triggerExit]);

  const onHide = useCallback(() => {
    setEnabled(false); // unmounts the widget (enabled gate below)
    showToast(t("shared:quickExit.toastHidden"), "info");
  }, [setEnabled, showToast, t]);

  if (!enabled) return null;

  const showTip = !seen;

  return (
    <div className={styles.root} data-reduced={prefersReduced ? "" : undefined}>
      {showTip && (
        <div className={styles.tooltip} role="status">
          <p className={styles.tooltipText}>
            <Translation
              i18nKey={
                keyTrigger
                  ? "shared:quickExit.tooltip.withShortcut"
                  : "shared:quickExit.tooltip.noShortcut"
              }
              components={{ strong: <strong /> }}
            />
          </p>
          <button
            type="button"
            className={styles.tooltipClose}
            onClick={dismissTip}
            aria-label={t("shared:quickExit.tooltip.dismissAria")}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      {showAbout && (
        <div
          className={styles.about}
          role="dialog"
          aria-label={t("shared:quickExit.about.aria")}
        >
          <p className={styles.aboutText}>{t("shared:quickExit.about.body")}</p>
          <p className={styles.aboutNote}>
            <Translation
              i18nKey="shared:quickExit.about.note"
              components={{ strong: <strong /> }}
            />
          </p>
          <div className={styles.aboutActions}>
            <button
              type="button"
              className={styles.aboutClose}
              onClick={() => setShowAbout(false)}
            >
              {t("shared:quickExit.about.gotIt")}
            </button>
            <button type="button" className={styles.aboutHide} onClick={onHide}>
              {t("shared:quickExit.about.hide")}
            </button>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={onExit}
          aria-label={t("shared:quickExit.button.aria")}
          aria-keyshortcuts={keyTrigger ? "Shift Shift" : undefined}
        >
          <FiLogOut aria-hidden="true" className={styles.icon} />
          <span className={styles.label}>
            {t("shared:quickExit.button.label")}
          </span>
          {keyTrigger && (
            <span className={styles.visuallyHidden}>
              {t("shared:quickExit.button.shortcutHint")}
            </span>
          )}
        </button>
        <button
          type="button"
          className={styles.info}
          onClick={() => setShowAbout((v) => !v)}
          aria-expanded={showAbout}
          aria-label={t("shared:quickExit.about.limitsAria")}
        >
          <span aria-hidden="true">?</span>
        </button>
      </div>
    </div>
  );
}
