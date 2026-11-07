import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useOutsideDismiss } from "../../../../shared/hooks/useOutsideDismiss";
import styles from "./VjRemoteKit.module.css";

/** Space kept between the popover and every viewport edge. */
const VJ_POPOVER_EDGE_PX = 12;
/** Space between the popover and its anchor. */
const VJ_POPOVER_ANCHOR_GAP_PX = 8;
/** The widest page gutter (--wrap-px): a panel that leaves no more than this
 *  on each side spans the dock, so it centres in the viewport. */
const VJ_POPOVER_DOCK_GUTTER_MAX_PX = 28;
/** The app's ease-out token (--ease-out) and fast duration (--dur-fast). */
const VJ_POPOVER_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_POPOVER_INSTANT = { duration: 0 };
const VJ_POPOVER_FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type VjPopoverPlacement = "above" | "below";

interface VjPopoverPosition {
  top: number;
  left: number;
  placement: VjPopoverPlacement;
}

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Above the anchor, centred on it; below when the room above runs out;
 *  always 12px clear of the viewport edges. A panel as wide as the dock
 *  (the phone layout) centres in the viewport, lined up with the dock. */
function placeVjPopover(
  anchor: HTMLElement,
  panel: HTMLElement,
): VjPopoverPosition {
  const anchorRect = anchor.getBoundingClientRect();
  // Layout size, which the opening scale leaves alone.
  const panelWidth = panel.offsetWidth;
  const panelHeight = panel.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const aboveTop = anchorRect.top - VJ_POPOVER_ANCHOR_GAP_PX - panelHeight;
  const placement: VjPopoverPlacement =
    aboveTop >= VJ_POPOVER_EDGE_PX ? "above" : "below";
  const preferredTop =
    placement === "above"
      ? aboveTop
      : anchorRect.bottom + VJ_POPOVER_ANCHOR_GAP_PX;
  const isDockWide =
    viewportWidth - panelWidth <= 2 * VJ_POPOVER_DOCK_GUTTER_MAX_PX;
  const preferredLeft = isDockWide
    ? (viewportWidth - panelWidth) / 2
    : anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
  return {
    placement,
    top: clampToRange(
      preferredTop,
      VJ_POPOVER_EDGE_PX,
      viewportHeight - panelHeight - VJ_POPOVER_EDGE_PX,
    ),
    left: clampToRange(
      preferredLeft,
      VJ_POPOVER_EDGE_PX,
      viewportWidth - panelWidth - VJ_POPOVER_EDGE_PX,
    ),
  };
}

function isSamePosition(
  first: VjPopoverPosition | null,
  second: VjPopoverPosition,
): boolean {
  return (
    first !== null &&
    first.placement === second.placement &&
    Math.abs(first.top - second.top) < 0.5 &&
    Math.abs(first.left - second.left) < 0.5
  );
}

/** Keeps the panel placed against its anchor while it is open: on open, on a
 *  resize or scroll, and when the panel's own content changes size. */
function useVjPopoverPosition(
  anchorRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
): VjPopoverPosition | null {
  const [position, setPosition] = useState<VjPopoverPosition | null>(null);
  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const next = placeVjPopover(anchor, panel);
    setPosition((current) => (isSamePosition(current, next) ? current : next));
  }, [anchorRef, panelRef]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    const panel = panelRef.current;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { capture: true, passive: true });
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    if (panel) observer?.observe(panel);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, { capture: true });
      observer?.disconnect();
    };
  }, [place, panelRef]);

  return position;
}

/**
 * Where focus goes when the popover closes: its anchor, unless a modal dialog
 * that does not hold the anchor covers it (the flash warning raised from a
 * switch in the Effects sheet, anchored on the dock under the sheet). Then
 * focus stays in that dialog: on the control that opened the popover when it
 * sits there, else on the dialog itself.
 */
function vjPopoverFocusReturnOf(
  anchor: HTMLElement | null,
  opener: Element | null,
): HTMLElement | null {
  const coveringDialogs = [
    ...document.querySelectorAll<HTMLElement>('[aria-modal="true"]'),
  ].filter((dialog) => anchor === null || !dialog.contains(anchor));
  const coveringDialog = coveringDialogs[coveringDialogs.length - 1] ?? null;
  if (coveringDialog === null) return anchor;
  if (
    opener instanceof HTMLElement &&
    opener.isConnected &&
    coveringDialog.contains(opener)
  ) {
    return opener;
  }
  return coveringDialog;
}

interface VjDockPopoverPanelProps {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  isOverSheets: boolean;
}

function VjDockPopoverPanel({
  anchorRef,
  onClose,
  labelledBy,
  children,
  className,
  isOverSheets,
}: VjDockPopoverPanelProps) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const panelRef = useRef<HTMLDivElement>(null);
  const shouldReturnFocusRef = useRef(false);
  // The control that held focus as the popover opened.
  const openerRef = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const position = useVjPopoverPosition(anchorRef, panelRef);

  // A press on the anchor counts as inside, so the anchor's own toggle
  // closes the popover exactly once.
  useOutsideDismiss(isPresent, panelRef, onClose, {
    onEscape: () => {
      shouldReturnFocusRef.current = true;
      onClose();
    },
    additionalInsideRef: anchorRef,
  });

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    openerRef.current = document.activeElement;
    const firstControl = panel.querySelector<HTMLElement>(VJ_POPOVER_FOCUSABLE);
    (firstControl ?? panel).focus({ preventScroll: true });
  }, []);

  // Escape inside the popover is the popover's own: it stops here, so a
  // sheet open under the popover (whose Escape listens on the document)
  // stays open.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      shouldReturnFocusRef.current = true;
      onCloseRef.current();
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, []);

  // On the way out, focus goes back to the anchor after Escape or when it
  // sat inside the popover; an outside press leaves it where the press put
  // it. Only then does the leaving panel turn inert, so the check above
  // still sees the focus where it was.
  useLayoutEffect(() => {
    if (isPresent) return;
    const panel = panelRef.current;
    const isFocusInside =
      panel !== null && panel.contains(document.activeElement);
    if (shouldReturnFocusRef.current || isFocusInside) {
      vjPopoverFocusReturnOf(anchorRef.current, openerRef.current)?.focus({
        preventScroll: true,
      });
    }
    panel?.setAttribute("inert", "");
  }, [isPresent, anchorRef]);

  const transition = reducedMotion ? VJ_POPOVER_INSTANT : VJ_POPOVER_TRANSITION;
  return (
    <m.div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={labelledBy}
      tabIndex={-1}
      data-theme="dark"
      data-vj-dock-popover=""
      data-over-sheets={isOverSheets ? "true" : undefined}
      data-placement={position?.placement ?? "above"}
      className={[styles.popover, className].filter(Boolean).join(" ")}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        originY: position?.placement === "below" ? 0 : 1,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={transition}
    >
      {children}
    </m.div>
  );
}

export interface VjDockPopoverProps {
  /** The control the popover belongs to; it opens above it and takes the
   *  focus back on close. */
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  /** Id of the popover's visible title. */
  labelledBy: string;
  children: ReactNode;
  className?: string;
  /** Paints above the remote's sheets (`--z-vj-flash-warning`). Only the
   *  flash warning sets it: a switch in the Effects sheet can raise it. */
  isOverSheets?: boolean;
}

/**
 * A small non-modal dialog fixed over the dock (BPM entry, pad tuner,
 * generator variants, flash consent). Portaled to <body> so the dock's own
 * stacking context never clips it. It closes on an outside press and on
 * Escape, focuses its first control on open, hands focus back to its anchor
 * (or to the covering sheet) on close, and fades and scales in and out
 * (instant under reduced motion).
 */
export function VjDockPopover({
  anchorRef,
  isOpen,
  onClose,
  labelledBy,
  children,
  className,
  isOverSheets = false,
}: VjDockPopoverProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <VjDockPopoverPanel
          key="vj-dock-popover"
          anchorRef={anchorRef}
          onClose={onClose}
          labelledBy={labelledBy}
          className={className}
          isOverSheets={isOverSheets}
        >
          {children}
        </VjDockPopoverPanel>
      )}
    </AnimatePresence>,
    document.body,
  );
}
