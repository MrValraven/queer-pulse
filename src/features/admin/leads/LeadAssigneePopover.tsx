import {
  useCallback,
  useEffect,
  useRef,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useAnchoredPopover } from "../../../shared/components/ui/useAnchoredPopover";
import {
  LEAD_ASSIGNEE_MOTION_EASE,
  LEAD_ASSIGNEE_MOTION_SECONDS,
} from "./leadAssignees.data";
import styles from "./LeadAssigneePicker.module.css";

/** Before it is placed the panel waits hidden, a little above its spot. */
const HIDDEN_BELOW_STATE = { opacity: 0, y: -4 };
/** A panel that opened above its anchor leaves downward, toward it. */
const HIDDEN_ABOVE_STATE = { opacity: 0, y: 4 };
const SHOWN_STATE = { opacity: 1, y: 0 };
/** A panel that opened above its anchor rises into place from below. */
const SHOWN_FROM_BELOW_STATE = { opacity: 1, y: [4, 0] };

const TABBABLE_SELECTOR =
  'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

/** The panel's elements that Tab can reach, in document order. */
function tabbablesIn(panel: HTMLElement | null): HTMLElement[] {
  if (panel === null) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.tabIndex !== -1 &&
      // A folding Collapse or a fading row set is inert on its way out.
      element.closest("[inert]") === null,
  );
}

/**
 * A floating dialog under its anchor, in a portal so no card clips it. Once
 * placed it focuses the first field inside. Escape, or Tab past either end
 * of the panel, closes it and asks for focus back on the anchor; a press
 * outside, or focus moving out of both the panel and the anchor, closes it
 * and leaves focus where it went. Tab moves between the search field and
 * the rows inside. The caller mounts it under
 * `AnimatePresence initial={false}` so it fades out on close.
 */
export function LeadAssigneePopover({
  anchorRef,
  label,
  onClose,
  children,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  label: string;
  onClose: (shouldRestoreFocus: boolean) => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const placement = useAnchoredPopover(anchorRef, panelRef, true);
  const isPlaced = placement !== null;
  const isFlipped = placement?.isFlipped ?? false;
  const { reducedMotion } = useMotionPrefs();
  // Reopened during its exit fade, AnimatePresence keeps this instance.
  const isPresent = useIsPresent();
  const savedOnClose = useRef(onClose);
  useEffect(() => {
    savedOnClose.current = onClose;
  });
  // A press outside on a focusable element fires both pointerdown and
  // focusout; the caller hears about the close once.
  const hasClosedRef = useRef(false);
  const closeOnce = useCallback((shouldRestoreFocus: boolean) => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    savedOnClose.current(shouldRestoreFocus);
  }, []);
  // Back from an exit, the panel can close again.
  useEffect(() => {
    if (isPresent) hasClosedRef.current = false;
  }, [isPresent]);

  // The panel is hidden until placed, and a hidden field refuses focus.
  // Placement and presence both gate it, so focus moves in again when the
  // panel returns from an exit.
  useEffect(() => {
    if (!isPlaced || !isPresent) return;
    panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [isPlaced, isPresent]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      closeOnce(false);
    };
    // On the document, so Escape still closes when focus fell to the body.
    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeOnce(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [anchorRef, closeOnce]);

  // The panel sits at the end of the body, so Tab past its last element
  // and Shift+Tab before its first close it and return to the anchor.
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const tabbables = tabbablesIn(panelRef.current);
    const edge = event.shiftKey ? tabbables[0] : tabbables.at(-1);
    if (tabbables.length > 0 && document.activeElement !== edge) return;
    event.preventDefault();
    closeOnce(true);
  };

  const onBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    // Focus leaving the page (a window switch) has no related target and
    // keeps the panel open.
    if (nextTarget === null) return;
    if (
      panelRef.current?.contains(nextTarget) ||
      anchorRef.current?.contains(nextTarget)
    ) {
      return;
    }
    closeOnce(false);
  };

  return createPortal(
    <m.div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className={styles.popover}
      data-placed={isPlaced || undefined}
      style={placement?.style}
      initial={HIDDEN_BELOW_STATE}
      animate={
        !isPlaced
          ? HIDDEN_BELOW_STATE
          : isFlipped
            ? SHOWN_FROM_BELOW_STATE
            : SHOWN_STATE
      }
      exit={isFlipped ? HIDDEN_ABOVE_STATE : HIDDEN_BELOW_STATE}
      transition={{
        duration: reducedMotion ? 0 : LEAD_ASSIGNEE_MOTION_SECONDS,
        ease: LEAD_ASSIGNEE_MOTION_EASE,
      }}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      {children}
    </m.div>,
    document.body,
  );
}
