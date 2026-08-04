import { useEffect, useRef, type RefObject } from "react";

/**
 * Marks every control that opens the nav drawer — the Navbar hamburger and the
 * BottomTabBar "More" tab. Used as the fallback focus target when the element
 * that actually opened the drawer has left the DOM (see below).
 */
export const NAV_DRAWER_TRIGGER_ATTRIBUTE = "data-nav-drawer-trigger";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus management for MobileNavDrawer: captures the control that opened the
 * drawer, traps Tab inside the panel, closes on Escape, and restores focus on
 * close. Extracted from the component so it stays inside the 200-line budget.
 */
export function useNavDrawerFocus({
  isOpen,
  panelRef,
  onClose,
}: {
  isOpen: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const lastPointerDownTargetRef = useRef<HTMLElement | null>(null);

  // Track the most recently pointer-pressed focusable element, independent of
  // isOpen so it is already populated by the time the open-effect below
  // reads it. This exists purely as a fallback for the Safari quirk described
  // there: Safari (desktop and iOS) does not move focus to a <button> on
  // pointer/touch activation, so document.activeElement is unreliable for the
  // hamburger and the "More" tab alike.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        lastPointerDownTargetRef.current = null;
        return;
      }
      // closest() handles clicks that land on an icon/svg *inside* the
      // trigger button rather than the button element itself.
      const focusableAncestor = target.closest<HTMLElement>(
        "button, a, [tabindex]",
      );
      lastPointerDownTargetRef.current =
        focusableAncestor ?? (target instanceof HTMLElement ? target : null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Capture whichever control opened the drawer — the hamburger in browser
    // mode, the More tab when installed — so focus returns there on close. The
    // previous implementation hardcoded the hamburger's ref, which would strand
    // focus once a second trigger existed.
    //
    // document.activeElement alone is not sufficient: Safari (macOS and iOS)
    // does not focus a <button> on pointer/touch click, only on keyboard
    // activation. A tap on the hamburger there leaves
    // document.activeElement === document.body, and focusing document.body on
    // close is a no-op — VoiceOver users lose their place entirely instead of
    // returning to the control they tapped. Keyboard-driven opens are
    // unaffected (activeElement correctly reflects the focused trigger), so we
    // only fall back to the pointerdown-tracked element when activeElement has
    // degraded to something unusable.
    const activeElement = document.activeElement;
    triggerRef.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : lastPointerDownTargetRef.current;
    const panel = panelRef.current;
    panel?.focus();

    const getFocusable = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocus(triggerRef.current);
      triggerRef.current = null;
    };
  }, [isOpen, panelRef, onClose]);
}

/**
 * Return focus to the captured trigger, or to the best live substitute.
 *
 * The captured element can be detached by the time the drawer closes: if
 * `isInstalled` flips true while the drawer is open (an install completes, or a
 * desktop PWA is resized), Navbar unmounts the hamburger while the drawer stays
 * open. Calling `.focus()` on a detached node is a silent no-op that drops
 * focus to <body>, stranding keyboard and screen-reader users at the top of the
 * document with no announcement — so check the node is still in the document
 * first and walk a fallback chain when it is not.
 */
function restoreFocus(capturedTrigger: HTMLElement | null) {
  if (capturedTrigger && document.contains(capturedTrigger)) {
    capturedTrigger.focus();
    return;
  }

  // The equivalent trigger that replaced it — the More tab took over from the
  // hamburger, or vice versa. Semantically the same control, so this is where
  // the user expects to land.
  const liveTrigger = document.querySelector<HTMLElement>(
    `[${NAV_DRAWER_TRIGGER_ATTRIBUTE}]`,
  );
  if (liveTrigger) {
    liveTrigger.focus();
    return;
  }

  // No nav trigger is mounted at all (the breakpoint moved past the drawer's
  // gate). Land on the page's own <main> rather than <body>: it is a labelled
  // landmark, so screen readers announce a real location instead of going
  // silent. tabIndex=-1 makes it programmatically focusable without adding it
  // to the tab order.
  const pageMain = document.querySelector<HTMLElement>("main[data-page-main]");
  if (!pageMain) return;
  pageMain.setAttribute("tabindex", "-1");
  pageMain.focus();
}
