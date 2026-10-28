import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ComponentType,
  type KeyboardEvent,
} from "react";
import { FiAlertTriangle, FiCheck, FiInfo, FiX } from "react-icons/fi";
import type { ToastItem, ToastPlacement } from "./toastDeck";
import type { ToastType } from "./toastContext";
import styles from "./Toast.module.css";

/** Inline style that also carries the custom properties the stylesheet reads. */
export type ToastStyle = CSSProperties & Record<`--${string}`, string | number>;

/** Success and error draw their stroke in; warning and info pop in. */
const GLYPHS: Record<ToastType, ComponentType> = {
  success: FiCheck,
  error: FiX,
  warning: FiAlertTriangle,
  info: FiInfo,
};

/**
 * The action joins the title's row only when the title and the action label
 * fit there on one line. With the action beside it, the full-width card
 * leaves the title about 180px for an action like "Desfazer", roughly 24
 * characters at the title's size, and a shorter label hands its width
 * back to the title, so the budget counts both.
 */
const INLINE_ACTION_CHARACTER_BUDGET = 32;

export function ToastCard({
  toast,
  placement,
  isPaused,
  dismissLabel,
  onAction,
  onDismiss,
  onEscapeDismiss,
  onFocusEnter,
  onFocusExit,
  onMeasure,
}: {
  toast: ToastItem;
  placement: ToastPlacement;
  isPaused: boolean;
  dismissLabel: string;
  onAction: (toast: ToastItem) => void;
  onDismiss: (id: number) => void;
  onEscapeDismiss: (id: number) => void;
  onFocusEnter: (id: number) => void;
  onFocusExit: (id: number) => void;
  onMeasure: (id: number, heightPx: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const Glyph = GLYPHS[toast.type];
  const hasInlineAction =
    toast.action !== undefined &&
    !toast.detail &&
    toast.title.length + toast.action.label.length <=
      INLINE_ACTION_CHARACTER_BUDGET;

  // The spread deck stacks each card under the measured heights of the cards
  // in front of it, and the folded deck sizes the cards behind to the front
  // one, so every card reports its natural height: its content plus its
  // border, read from the content box, which keeps its own size while the
  // card is drawn at another height. The first reading happens here, before
  // the first paint, and the observer reports every change after it.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const body = bodyRef.current;
    if (!card || !body) return;
    const reportHeight = () =>
      onMeasure(
        toast.id,
        body.offsetHeight + card.offsetHeight - card.clientHeight,
      );
    reportHeight();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(reportHeight);
    observer.observe(body);
    return () => observer.disconnect();
  }, [toast.id, onMeasure]);

  // Escape from either button takes this toast down and stops there, so a
  // dialog underneath stays open. The provider hands focus on first.
  const dismissOnEscape = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    onEscapeDismiss(toast.id);
  };

  const style: ToastStyle = {
    "--toast-offset": `${placement.offsetPx}px`,
    "--toast-scale": placement.scale,
    "--toast-layer": placement.layer,
    "--toast-lifetime": `${toast.lifetimeMs}ms`,
  };
  if (placement.heightPx !== undefined) {
    style["--toast-height"] = `${placement.heightPx}px`;
  }

  return (
    <div
      ref={cardRef}
      className={[
        styles.toast,
        styles[toast.type],
        toast.isLeaving && styles.leaving,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      // Lets the provider find this card's buttons to hand focus to.
      data-toast-id={toast.id}
      // A leaving card takes no more clicks or focus.
      inert={toast.isLeaving}
      // The hairline drains with the countdown and holds whenever it holds.
      data-paused={isPaused || undefined}
      data-tucked={placement.isTucked || undefined}
      data-behind={placement.isBehind || undefined}
      // Keyboard focus reaching the action or the close button holds this
      // toast's countdown and spreads the deck. Moving between the two buttons
      // stays inside the card, so it keeps the hold.
      onFocusCapture={() => onFocusEnter(toast.id)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (
          nextTarget instanceof Node &&
          event.currentTarget.contains(nextTarget)
        )
          return;
        onFocusExit(toast.id);
      }}
    >
      <div
        ref={bodyRef}
        className={styles.body}
        data-inline-action={hasInlineAction || undefined}
      >
        <span className={styles.seal} aria-hidden>
          <Glyph />
        </span>
        <div className={styles.text}>
          <p className={styles.title}>{toast.title}</p>
          {toast.detail && <p className={styles.detail}>{toast.detail}</p>}
        </div>
        {toast.action && (
          <button
            type="button"
            className={styles.action}
            onClick={() => onAction(toast)}
            onKeyDown={dismissOnEscape}
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          className={styles.close}
          data-toast-dismiss=""
          onClick={() => onDismiss(toast.id)}
          onKeyDown={dismissOnEscape}
          aria-label={dismissLabel}
        >
          <FiX aria-hidden />
        </button>
      </div>
      <span className={styles.timer} aria-hidden />
    </div>
  );
}
