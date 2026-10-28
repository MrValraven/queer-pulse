import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useTranslation } from "../../i18n/useTranslation";
import {
  ToastContext,
  type ToastAction,
  type ToastMessage,
  type ToastType,
} from "./toastContext";
import {
  RESTING_PLACEMENT,
  defaultLifetimeMs,
  layoutDeck,
  type ToastItem,
} from "./toastDeck";
import { ToastCard, type ToastStyle } from "./ToastCard";
import { useCountdownHolds, useToastTimerStore } from "./toastTimers";
import { useToastDeckHold } from "./useToastDeckHold";
import { useToastFocusReturn } from "./useToastFocusReturn";
import styles from "./Toast.module.css";

/** A card leaves the DOM once its exit animation (280ms) has played out. */
const EXIT_MS = 300;

/**
 * One live region per politeness level.
 *
 * `polite` waits for a pause; `assertive` interrupts. Errors have to interrupt:
 * a failure announced after everything else the user is reading arrives too late
 * to act on (WCAG 4.1.3 Status Messages). Both regions render from the first
 * paint and stay mounted, because assistive tech only watches regions it
 * already knows about and routinely misses one inserted at announce time.
 * Each region is a plain wrapper: the cards inside are placed against the
 * container, so the deck spans both regions as one stack.
 */
function ToastRegion({
  politeness,
  children,
}: {
  politeness: "polite" | "assertive";
  children: ReactNode;
}) {
  return (
    <div
      className={styles.region}
      aria-live={politeness}
      aria-atomic="true"
      role={politeness === "assertive" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const isMotionReduced = usePrefersReducedMotion();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [heights, setHeights] = useState<ReadonlyMap<number, number>>(
    () => new Map(),
  );
  const {
    containerRef,
    isHeld: isPointerHolding,
    pointerHandlers,
    release: releasePointerHold,
  } = useToastDeckHold();
  const { focusHandlers, handFocusOn } = useToastFocusReturn(containerRef);
  const [focusedToastId, setFocusedToastId] = useState<number | null>(null);
  const nextId = useRef(0);
  const { timersRef, removalTimeoutIdsRef } = useToastTimerStore();

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    setHeights((current) => {
      if (!current.has(id)) return current;
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      // Every toast showing holds a timer, so a toast without one is already
      // leaving or gone, and a second close, Escape or action does nothing.
      // Clearing the pending auto-dismiss keeps it from firing after a manual
      // close. The wait below is the leave animation, which never pauses.
      const timer = timersRef.current.get(id);
      if (!timer) return;
      if (timer.timeoutId !== null) window.clearTimeout(timer.timeoutId);
      timersRef.current.delete(id);
      // With the last toast gone the stack stops taking the pointer, and no
      // leave event may follow, so the hover or press hold ends here and the
      // next toast arrives folded and counting down.
      if (timersRef.current.size === 0) releasePointerHold();
      setToasts((current) =>
        current.map((toast) =>
          toast.id === id ? { ...toast, isLeaving: true } : toast,
        ),
      );
      const removalTimeoutId = window.setTimeout(() => {
        removalTimeoutIdsRef.current.delete(removalTimeoutId);
        remove(id);
      }, EXIT_MS);
      removalTimeoutIdsRef.current.add(removalTimeoutId);
    },
    [timersRef, removalTimeoutIdsRef, remove, releasePointerHold],
  );

  const startTimer = useCallback(
    (id: number, durationMs: number) => {
      timersRef.current.set(id, {
        timeoutId: window.setTimeout(() => dismiss(id), durationMs),
        endAt: Date.now() + durationMs,
        remaining: durationMs,
        isPaused: false,
      });
    },
    [timersRef, dismiss],
  );
  useCountdownHolds(
    timersRef,
    isPointerHolding,
    focusedToastId,
    toasts,
    startTimer,
  );

  const showToast = useCallback(
    (
      message: string | ToastMessage,
      type: ToastType = "success",
      durationMs?: number,
      action?: ToastAction,
    ) => {
      const id = nextId.current++;
      const lifetimeMs = durationMs ?? defaultLifetimeMs(type, Boolean(action));
      const text: ToastMessage =
        typeof message === "string" ? { title: message } : message;
      const { title, detail } = text;
      setToasts((current) => [
        ...current,
        { id, title, detail, type, isLeaving: false, action, lifetimeMs },
      ]);
      startTimer(id, lifetimeMs);
      return id;
    },
    [startTimer],
  );

  const runAction = useCallback(
    (toast: ToastItem) => {
      // A leaving toast has no timer left, and its action stays spent.
      if (!timersRef.current.has(toast.id)) return;
      toast.action?.onClick();
      dismiss(toast.id);
    },
    [timersRef, dismiss],
  );

  // Escape hands focus on before the card goes inert (see useToastFocusReturn).
  const dismissFromEscape = useCallback(
    (id: number) => {
      handFocusOn(id, toasts);
      dismiss(id);
    },
    [handFocusOn, toasts, dismiss],
  );

  const handleFocusEnter = useCallback((id: number) => {
    setFocusedToastId(id);
  }, []);
  const handleFocusExit = useCallback((id: number) => {
    setFocusedToastId((current) => (current === id ? null : current));
  }, []);
  const handleMeasure = useCallback((id: number, heightPx: number) => {
    setHeights((current) =>
      current.get(id) === heightPx
        ? current
        : new Map(current).set(id, heightPx),
    );
  }, []);

  // `dismissToast` is the same exit a manual close takes; an id already gone
  // finds no toast and changes nothing.
  const value = useMemo(
    () => ({ showToast, dismissToast: dismiss }),
    [showToast, dismiss],
  );
  const dismissLabel = t("shared:toast.dismiss");

  const hasShowingToasts = toasts.some((toast) => !toast.isLeaving);
  const isSpread =
    isPointerHolding ||
    toasts.some((toast) => toast.id === focusedToastId && !toast.isLeaving);
  const { placements, stackHeightPx } = useMemo(
    () => layoutDeck(toasts, heights, isSpread),
    [toasts, heights, isSpread],
  );
  const newestFirst = [...toasts].reverse();
  const containerStyle: ToastStyle = {
    "--toast-stack-height": `${stackHeightPx}px`,
  };

  const renderCard = (toast: ToastItem) => (
    <ToastCard
      key={toast.id}
      toast={toast}
      placement={placements.get(toast.id) ?? RESTING_PLACEMENT}
      isPaused={isPointerHolding || focusedToastId === toast.id}
      dismissLabel={dismissLabel}
      onAction={runAction}
      onDismiss={dismiss}
      onEscapeDismiss={dismissFromEscape}
      onFocusEnter={handleFocusEnter}
      onFocusExit={handleFocusExit}
      onMeasure={handleMeasure}
    />
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* A mouse resting on the stack, or a press on the folded deck, spreads
          it and holds every countdown; leaving it, or a press elsewhere, folds
          the deck and lets them all run again. Each region lists its cards
          newest first, so Tab walks them in the order they show. */}
      <div
        ref={containerRef}
        className={styles.container}
        style={containerStyle}
        data-toast-region=""
        data-has-toasts={hasShowingToasts || undefined}
        data-reduced-motion={isMotionReduced || undefined}
        {...pointerHandlers}
        {...focusHandlers}
      >
        <ToastRegion politeness="polite">
          {newestFirst
            .filter((toast) => toast.type !== "error")
            .map(renderCard)}
        </ToastRegion>
        <ToastRegion politeness="assertive">
          {newestFirst
            .filter((toast) => toast.type === "error")
            .map(renderCard)}
        </ToastRegion>
      </div>
    </ToastContext.Provider>
  );
}
