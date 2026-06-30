import { useEffect, useState, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import styles from "./DestructiveActionFlow.module.css";

type Phase = "confirm" | "loading" | "done";

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
 */
export function DestructiveActionFlow({
  content,
  onClose,
}: {
  content: DestructiveActionContent;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("confirm");
  useScrollLock();

  useEffect(() => {
    if (phase !== "confirm") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => setPhase("done"), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && phase === "confirm") onClose();
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
            <Button variant="ghost-dark" to={routes.homepage}>
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
                <Button variant="primary" onClick={() => setPhase("loading")}>
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
