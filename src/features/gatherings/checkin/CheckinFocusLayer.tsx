import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { LayoutGroup } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useScrollLock } from "../../../shared/hooks/useScrollLock";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { playFocusLayerMove } from "./focusLayerMotion";
import { returnFocusFromRemovedParts, trapTabInside } from "./trapTabInside";
import styles from "./CheckinFocusLayer.module.css";

/** Stamps `<html data-checkin-focus>` while the layer covers the page, so
 *  standalone.css drops `--bottom-inset` to its no-bar value: the bottom tab
 *  bar sits under the layer, and chrome painting over it (the consent banner,
 *  the quick exit) has no bar to clear. */
function useCoveredTabBarSignal(isCovering: boolean) {
  useEffect(() => {
    if (!isCovering) return;
    const root = document.documentElement;
    root.setAttribute("data-checkin-focus", "true");
    return () => root.removeAttribute("data-checkin-focus");
  }, [isCovering]);
}

interface CheckinFocusLayerProps {
  isOpen: boolean;
  /** Part of the caller contract. The toolbar toggle and Escape (see
   *  useFocusMode) leave focus mode, so the layer draws no exit button. */
  onExit: () => void;
  children: ReactNode;
}

/**
 * Renders the check-in panel inline, or lifts it into a full-screen layer above
 * the page chrome in focus mode. While the panel is in the layer, an
 * aria-hidden placeholder of its last inline height holds its slot, so nothing
 * below reflows, and the page keeps its scroll position for the way back. The
 * panel glides between the slot and the layer (see playFocusLayerMove).
 */
export function CheckinFocusLayer({
  isOpen,
  children,
}: CheckinFocusLayerProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const layerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const hasEnteredRef = useRef(false);
  // The children render exactly once: inline while closed, inside the layer
  // while open or fading out. Switching during render mounts the layer and
  // empties the slot in one commit, so every frame paints one copy. Inline
  // returns only after the panel has glided back over the slot.
  const [isInlineVisible, setIsInlineVisible] = useState(!isOpen);
  // The inline panel's last measured height. The placeholder applies it in the
  // same commit that empties the slot, so no layout ever sees the shorter page
  // and the browser never clamps the scroll position.
  const [inlineHeight, setInlineHeight] = useState(0);
  // Counts trips into focus mode. Both layout groups take it in their key and
  // id, so every trip starts with fresh layoutId stacks: a row never animates
  // from a snapshot an earlier trip took while the page was scroll locked.
  const [focusSession, setFocusSession] = useState(0);

  if (isOpen && isInlineVisible) {
    setIsInlineVisible(false);
    setFocusSession(focusSession + 1);
  }

  useEffect(() => {
    const slot = slotRef.current;
    if (!isInlineVisible || !slot) return;
    if (typeof ResizeObserver === "undefined") return;
    // The observer reports once on observe, then on every resize.
    const observer = new ResizeObserver(() => {
      setInlineHeight(slot.getBoundingClientRect().height);
    });
    observer.observe(slot);
    return () => observer.disconnect();
  }, [isInlineVisible]);

  // Held until the inline panel is back. The lock records the scroll position
  // after the placeholder holds the slot and restores it on release, so it is
  // the one place the page's scroll position comes back from.
  useScrollLock(!isInlineVisible);
  // Keyed to the layer itself, which stays mounted through the move back, so
  // the tab bar's space comes back in the commit that returns the panel
  // inline.
  useCoveredTabBarSignal(!isInlineVisible);

  useEffect(() => {
    if (!isInlineVisible || !wasOpenRef.current) return;
    wasOpenRef.current = false;
    document.querySelector<HTMLElement>("[data-checkin-focus-toggle]")?.focus();
  }, [isInlineVisible]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!isOpen) {
      layer?.setAttribute("inert", "");
      layer?.setAttribute("aria-hidden", "true");
      return;
    }
    wasOpenRef.current = true;
    layer?.removeAttribute("inert");
    layer?.removeAttribute("aria-hidden");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (layerRef.current) trapTabInside(event, layerRef.current);
    };
    document.addEventListener("keydown", handleKeyDown);
    const findSearchInput = () =>
      layerRef.current?.querySelector<HTMLInputElement>('input[type="search"]');
    const searchInput = findSearchInput();
    // preventScroll: mid-move the field sits where the slot was, and scrolling
    // it into view would shift the layer under the panel.
    if (searchInput) searchInput.focus({ preventScroll: true });
    const frameId = searchInput
      ? 0
      : requestAnimationFrame(() =>
          findSearchInput()?.focus({ preventScroll: true }),
        );
    // A toast or the consent banner the host tabbed into can vanish under
    // focus; the search field takes it back so focus stays in the door view.
    const stopReturningFocus = returnFocusFromRemovedParts(findSearchInput);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(frameId);
      stopReturningFocus();
    };
  }, [isOpen]);

  // A layout effect, so the panel's first frame in the layer already sits
  // over the slot it left. The exit holds its last frame (the panel over the
  // slot, the backdrop clear); flushSync then unmounts the layer and brings
  // the panel back inline in this same task, and React runs the sync commit's
  // effects (the scroll lock's release among them) before the browser paints,
  // so the swap is invisible.
  useLayoutEffect(() => {
    if (isInlineVisible) {
      hasEnteredRef.current = false;
      return;
    }
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    const slot = slotRef.current;
    if (!backdrop || !panel || !slot) return;
    const move = !isOpen
      ? "exit"
      : hasEnteredRef.current
        ? "enter"
        : "enterFromSlot";
    hasEnteredRef.current = true;
    let isCurrent = true;
    void playFocusLayerMove(
      { backdrop, panel, slot },
      move,
      reducedMotion,
    ).then((isFinished) => {
      if (isOpen || !isFinished || !isCurrent) return;
      flushSync(() => setIsInlineVisible(true));
    });
    return () => {
      isCurrent = false;
    };
  }, [isOpen, isInlineVisible, reducedMotion]);

  // Each container gets its own layout group, which prefixes every layoutId
  // inside it, so a guest row never matches its own copy in the other
  // container and nothing flies between the page and the layer.
  return (
    <>
      <div
        ref={slotRef}
        className={styles.slot}
        aria-hidden={isInlineVisible ? undefined : true}
        style={isInlineVisible ? undefined : { height: inlineHeight }}
      >
        <LayoutGroup key={focusSession} id={`checkin-inline-${focusSession}`}>
          {isInlineVisible && children}
        </LayoutGroup>
      </div>
      {!isInlineVisible &&
        createPortal(
          <div
            ref={layerRef}
            role="region"
            aria-label={t("gatherings:checkin.focus.regionLabel")}
            className={styles.layer}
          >
            <div ref={backdropRef} className={styles.backdrop} />
            <div ref={panelRef} className={styles.panel}>
              <LayoutGroup
                key={focusSession}
                id={`checkin-focus-${focusSession}`}
              >
                {children}
              </LayoutGroup>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
