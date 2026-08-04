import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiRotateCcw,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { ToastContext, type ToastType, type ToastAction } from "./toastContext";
import styles from "./Toast.module.css";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  leaving: boolean;
  action?: ToastAction;
}

const ICONS: Record<ToastType, ComponentType> = {
  success: FiCheckCircle,
  error: FiXCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

/**
 * One live region per politeness level.
 *
 * `polite` waits for a pause; `assertive` interrupts. Errors have to interrupt —
 * a failure announced after everything else the user is reading arrives too late
 * to act on (WCAG 4.1.3 Status Messages). Both regions render from the first
 * paint and stay mounted: a live region inserted at announce time is routinely
 * missed, because assistive tech only watches regions it already knows about.
 */
function ToastRegion({
  politeness,
  toasts,
  onAction,
  onDismiss,
  onPause,
  onResume,
  dismissLabel,
}: {
  politeness: "polite" | "assertive";
  toasts: ToastItem[];
  onAction: (toast: ToastItem) => void;
  onDismiss: (id: number) => void;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
  dismissLabel: string;
}) {
  return (
    <div
      className={styles.region}
      aria-live={politeness}
      aria-atomic="true"
      role={politeness === "assertive" ? "alert" : "status"}
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={[
              styles.toast,
              styles[toast.type],
              toast.leaving && styles.leaving,
            ]
              .filter(Boolean)
              .join(" ")}
            // Pause the auto-dismiss countdown while the pointer rests on the
            // toast so it can be read/acted on; resume on leave. Focus within
            // (keyboard reaching the action/close) pauses too, for parity.
            onPointerEnter={() => onPause(toast.id)}
            onPointerLeave={() => onResume(toast.id)}
            onFocusCapture={() => onPause(toast.id)}
            onBlurCapture={() => onResume(toast.id)}
          >
            <span className={styles.icon} aria-hidden>
              <Icon />
            </span>
            <span className={styles.message}>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className={styles.action}
                onClick={() => onAction(toast)}
              >
                <FiRotateCcw aria-hidden />
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              className={styles.close}
              onClick={() => onDismiss(toast.id)}
              aria-label={dismissLabel}
            >
              <FiX aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** The live auto-dismiss timer for one toast, tracked so hovering can pause it.
 *  `remaining` is refreshed on pause; `endAt` lets us compute what's left. */
interface ToastTimer {
  timeoutId: number;
  endAt: number;
  remaining: number;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Map<number, ToastTimer>>(new Map());

  const remove = useCallback((id: number) => {
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      // Clear any pending auto-dismiss timer so it can't fire twice (e.g. after
      // a manual close). The 300ms below is the leave animation, not paused.
      const timer = timers.current.get(id);
      if (timer) {
        window.clearTimeout(timer.timeoutId);
        timers.current.delete(id);
      }
      setToasts((current) =>
        current.map((toast) =>
          toast.id === id ? { ...toast, leaving: true } : toast,
        ),
      );
      window.setTimeout(() => remove(id), 300);
    },
    [remove],
  );

  const schedule = useCallback(
    (id: number, ms: number) => {
      const timeoutId = window.setTimeout(() => dismiss(id), ms);
      timers.current.set(id, { timeoutId, endAt: Date.now() + ms, remaining: ms });
    },
    [dismiss],
  );

  // Hover/focus pause: freeze the countdown, banking what's left; resume rearms
  // it from that remainder. A toast already leaving has no timer entry, so these
  // are safe no-ops on it.
  const pause = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (!timer) return;
    window.clearTimeout(timer.timeoutId);
    timer.remaining = Math.max(0, timer.endAt - Date.now());
  }, []);

  const resume = useCallback(
    (id: number) => {
      const timer = timers.current.get(id);
      if (!timer) return;
      schedule(id, timer.remaining);
    },
    [schedule],
  );

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      durationMs?: number,
      action?: ToastAction,
    ) => {
      const id = nextId.current++;
      // Action toasts (e.g. Undo) linger a little longer so they're reachable.
      const ms = durationMs ?? (action ? 5200 : 3400);
      setToasts((current) => [
        ...current,
        { id, message, type, leaving: false, action },
      ]);
      schedule(id, ms);
    },
    [schedule],
  );

  const runAction = useCallback(
    (toast: ToastItem) => {
      toast.action?.onClick();
      dismiss(toast.id);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  const dismissLabel = t("shared:toast.dismiss");

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container}>
        <ToastRegion
          politeness="polite"
          toasts={toasts.filter((toast) => toast.type !== "error")}
          onAction={runAction}
          onDismiss={dismiss}
          onPause={pause}
          onResume={resume}
          dismissLabel={dismissLabel}
        />
        <ToastRegion
          politeness="assertive"
          toasts={toasts.filter((toast) => toast.type === "error")}
          onAction={runAction}
          onDismiss={dismiss}
          onPause={pause}
          onResume={resume}
          dismissLabel={dismissLabel}
        />
      </div>
    </ToastContext.Provider>
  );
}
