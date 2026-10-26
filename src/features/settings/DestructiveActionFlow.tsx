import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import { Button, useDismiss } from "../../shared/components/ui";
import { logError } from "../../shared/observability/logger";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isReauthRequiredError } from "./api/reauthRequiredError";
import styles from "./DestructiveActionFlow.module.css";

type Phase = "confirm" | "loading" | "done" | "error";

export interface DestructiveActionContent {
  tone: "accent" | "plum";
  icon: ReactNode;
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  confirmLabel: string;
  loadingText: string;
  resultTitle: ReactNode;
  resultBody: ReactNode;
}

/**
 * Shared confirm → loading → plum-panel-result dialog for destructive account
 * actions (deactivate / delete). Mounted only when open, so it owns scroll lock
 * and the phase machine unconditionally.
 *
 * `action` performs the real request (re-auth + deletion/deactivation, or a
 * demo-simulated success). A rejected promise lands on an honest error phase,
 * never the success panel. `onDone` fires when the member leaves the result
 * (used to kill the session on success).
 *
 * A `ReauthRequiredError` rejection means the action found no step-up token
 * and opened the code dialog without doing anything, so the flow goes back to
 * the confirm phase quietly: no error panel, nothing logged, and the confirm
 * button works again for the press that follows the code.
 *
 * `action` is REQUIRED, and PRD-01 is why. It used to be optional, with a
 * 1.4-second `setTimeout` standing in when a caller left it out. The Settings
 * Data pane left it out: a member who paused their account watched the loading
 * spinner and then the success panel while no request was ever made, their
 * `users.status` never changed, their session was never killed and they stayed
 * fully visible and messageable. A dialog that can show a success panel for a
 * request that did not happen is a dialog that eventually will, so the
 * fallback is gone and omitting the action is now a compile error.
 */
export function DestructiveActionFlow({
  content,
  action,
  onDone,
  onClose,
}: {
  content: DestructiveActionContent;
  action: () => Promise<void>;
  onDone?: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("confirm");
  const canDismiss = phase === "confirm" || phase === "error";

  // Confirming account deletion deserves the same a11y guarantees as every
  // other dialog in the app, so this leans on the shared hook behind `Modal`:
  // scroll lock, initial focus into the dialog, a Tab trap, Escape, and focus
  // restore to the trigger. Escape stays guarded so it can't dismiss mid-request
  // or on the result panel (the hook reads the latest callback each time).
  const dialogRef = useDismiss(() => {
    if (canDismiss) onClose();
  });

  // Set when the action stopped for a step-up code. The code dialog has just
  // opened on top and owns focus, so the return to "confirm" leaves it there.
  const shouldKeepFocusRef = useRef(false);

  // Each phase swaps the dialog's contents out from under the focused control,
  // so move focus back inside whenever the phase changes.
  useEffect(() => {
    if (shouldKeepFocusRef.current) {
      shouldKeepFocusRef.current = false;
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog) return;
    // The code dialog can mount in the same commit as "loading", so leave
    // focus alone while it sits in another open modal on top of this one.
    const activeElement = document.activeElement;
    if (
      activeElement &&
      !dialog.contains(activeElement) &&
      activeElement.closest('[aria-modal="true"]')
    ) {
      return;
    }
    const firstFocusable = dialog.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    (firstFocusable ?? dialog).focus();
  }, [phase, dialogRef]);

  const run = useCallback(async () => {
    // A flag left by a stop whose phase change never rendered must not skip
    // the focus move for this run.
    shouldKeepFocusRef.current = false;
    setPhase("loading");
    try {
      await action();
      setPhase("done");
    } catch (err) {
      if (isReauthRequiredError(err)) {
        shouldKeepFocusRef.current = true;
        setPhase("confirm");
        return;
      }
      logError(err, {
        where: "DestructiveActionFlow",
        eyebrow: content.eyebrow,
      });
      setPhase("error");
    }
  }, [action, content.eyebrow]);

  // Portal to <body>: the settings panes sit inside <FadeIn>
  // (`will-change: transform`), which makes a containing block for fixed
  // descendants and would otherwise mis-position this fixed overlay.
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && canDismiss) onClose();
      }}
    >
      {/* One dialog node across every phase: the focus trap holds a reference
          to it, so swapping the element per phase would leave the trap pointing
          at a node that is no longer in the document. */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={phase === "done" ? styles.result : styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={content.eyebrow}
        aria-busy={phase === "loading"}
      >
        {phase === "done" ? (
          <>
            <div className={styles.resultIcon}>
              <FiCheck />
            </div>
            <h3 className={styles.resultTitle}>{content.resultTitle}</h3>
            <p className={styles.resultBody}>{content.resultBody}</p>
            <div className={styles.resultBtns}>
              <Button
                variant="ghost-dark"
                to={routes.homepage}
                onClick={() => onDone?.()}
              >
                {t("settings:destructiveFlow.backToHome")}
              </Button>
            </div>
          </>
        ) : (
          <>
            {phase === "loading" ? (
              <>
                <div className={styles.spinner} aria-hidden="true" />
                <p className={styles.loadingText}>{content.loadingText}</p>
              </>
            ) : phase === "error" ? (
              <>
                <div className={`${styles.icon} ${styles.iconAccent}`}>
                  <FiAlertTriangle />
                </div>
                <div className={styles.eyebrow}>{content.eyebrow}</div>
                <h3 className={styles.title}>
                  <Translation
                    i18nKey="settings:destructiveFlow.error.title"
                    components={{ em: <em /> }}
                  />
                </h3>
                <p className={styles.body}>
                  {t("settings:destructiveFlow.error.body")}
                </p>
                <div className={styles.btns}>
                  <Button variant="ghost" onClick={onClose}>
                    {t("settings:destructiveFlow.error.close")}
                  </Button>
                  <Button variant="primary" onClick={() => void run()}>
                    {t("settings:destructiveFlow.error.tryAgain")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`${styles.icon} ${content.tone === "accent" ? styles.iconAccent : styles.iconPlum}`}
                >
                  {content.icon}
                </div>
                <div className={styles.eyebrow}>{content.eyebrow}</div>
                <h3 className={styles.title}>{content.title}</h3>
                <p className={styles.body}>{content.body}</p>
                <div className={styles.btns}>
                  <Button variant="ghost" onClick={onClose}>
                    {t("settings:destructiveFlow.confirm.notNow")}
                  </Button>
                  <Button variant="primary" onClick={() => void run()}>
                    {content.confirmLabel}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
