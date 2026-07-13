import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { logError } from "../../shared/observability/logger";
import { routes } from "../../app/routeMap";
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
 * demo-simulated success). A rejected promise lands on an honest error phase —
 * never the success panel. When omitted, the flow falls back to a short
 * simulated delay (legacy callers). `onDone` fires when the member leaves the
 * result (used to kill the session on success).
 */
export function DestructiveActionFlow({
  content,
  action,
  onDone,
  onClose,
}: {
  content: DestructiveActionContent;
  action?: () => Promise<void>;
  onDone?: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("confirm");
  useScrollLock();

  useEffect(() => {
    if (phase !== "confirm" && phase !== "error") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  const run = useCallback(async () => {
    setPhase("loading");
    try {
      if (action) await action();
      else await new Promise((resolve) => setTimeout(resolve, 1400));
      setPhase("done");
    } catch (err) {
      logError(err, {
        where: "DestructiveActionFlow",
        eyebrow: content.eyebrow,
      });
      setPhase("error");
    }
  }, [action, content.eyebrow]);

  const canDismiss = phase === "confirm" || phase === "error";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && canDismiss) onClose();
      }}
    >
      {phase === "done" ? (
        <div
          className={styles.result}
          role="dialog"
          aria-modal="true"
          aria-label={content.eyebrow}
        >
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
              Back to QueerPulse
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={content.eyebrow}
          aria-busy={phase === "loading"}
        >
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
                That didn't <em>go through.</em>
              </h3>
              <p className={styles.body}>
                We couldn't complete this just now — nothing was changed. Check
                your connection and try again, or come back in a moment.
              </p>
              <div className={styles.btns}>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={run}>
                  Try again
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
                  Not now
                </Button>
                <Button variant="primary" onClick={run}>
                  {content.confirmLabel}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
