import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, m } from "motion/react";
import type { IconType } from "react-icons";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useOutsideDismiss } from "../../../../shared/hooks/useOutsideDismiss";
import { fitStudioPopover } from "./studioPopoverFit";
import styles from "./StudioPlayerControls.module.css";

/** Keeps the open panel inside the viewport: measured on open and on
 *  resize, written as CSS variables the module reads. */
function useStudioPopoverFit(
  isOpen: boolean,
  panelRef: RefObject<HTMLDivElement | null>,
  triggerId: string,
  placement: "up" | "down",
) {
  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const panel = panelRef.current;
      const trigger = document.getElementById(triggerId);
      if (!panel || !trigger) return;
      panel.style.setProperty("--popover-shift-x", "0px");
      const panelRect = panel.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const fit = fitStudioPopover({
        panelLeft: panelRect.left,
        panelWidth: panelRect.width,
        triggerTop: triggerRect.top,
        triggerBottom: triggerRect.bottom,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: window.innerHeight,
        placement,
      });
      panel.style.setProperty("--popover-shift-x", `${fit.shiftX}px`);
      panel.style.setProperty(
        "--popover-max-block-size",
        `${fit.maxBlockSize}px`,
      );
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [isOpen, panelRef, triggerId, placement]);
}

/** A disclosure popover anchored to an icon button. */
export function StudioPlayerPopover({
  label,
  icon: Icon,
  placement,
  children,
}: {
  label: string;
  icon: IconType;
  placement: "up" | "down";
  children: (close: () => void) => ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const panelId = useId();
  const triggerId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Found by id: `close` reaches the panel's render function, which may not
  // read a ref. Focus moves in the same press, before any sheet opens.
  const close = () => {
    setIsOpen(false);
    document.getElementById(triggerId)?.focus();
  };
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false));
  // While open, Escape is caught on the document in the capture phase and
  // stops there, wherever focus sits (a press on the panel's padding leaves
  // it on body). An enclosing dialog (Now playing) listening on the document
  // in the bubble phase stays open.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      const focused = document.activeElement;
      const shouldReturnFocus =
        !focused ||
        focused === document.body ||
        Boolean(wrapRef.current?.contains(focused));
      setIsOpen(false);
      if (shouldReturnFocus) document.getElementById(triggerId)?.focus();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, triggerId]);
  useStudioPopoverFit(isOpen, panelRef, triggerId, placement);
  useEffect(() => {
    if (isOpen)
      panelRef.current?.querySelector<HTMLElement>("button, input")?.focus();
  }, [isOpen]);
  const offset = placement === "up" ? 6 : -6;
  return (
    <div
      ref={wrapRef}
      className={styles.popoverWrap}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (nextFocus && !event.currentTarget.contains(nextFocus))
          setIsOpen(false);
      }}
    >
      <button
        id={triggerId}
        type="button"
        className={styles.iconButton}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={label}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <Icon aria-hidden />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="panel"
            ref={panelRef}
            id={panelId}
            role="group"
            aria-label={label}
            className={styles.popover}
            data-placement={placement}
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: offset }}
            transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            {children(close)}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
