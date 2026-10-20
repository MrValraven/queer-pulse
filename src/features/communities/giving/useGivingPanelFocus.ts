import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import {
  NavigationType,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

/** History state the sidebar card navigates with, so the tab scrolls its
 *  panel into view once it has rendered. */
export interface GivingNavigationState {
  shouldScrollToGiving?: boolean;
}

/** The hub's tab strip (LivingHubTabs). Its scroll margin keeps it clear of
 *  the fixed nav, so the selected Support tab stays in sight above the panel. */
const TAB_STRIP_ID = "community-tabs";

/** Scrolls the hub's tab strip (or, without one, the support panel) to the
 *  top of the view and moves focus to the panel's heading (the element its
 *  `aria-labelledby` names) without a second scroll. */
export function revealGivingPanel(
  panel: HTMLElement,
  isReducedMotion: boolean,
) {
  const scrollTarget = document.getElementById(TAB_STRIP_ID) ?? panel;
  scrollTarget.scrollIntoView({
    block: "start",
    behavior: isReducedMotion ? "auto" : "smooth",
  });
  const headingId = panel.getAttribute("aria-labelledby");
  const heading = headingId ? document.getElementById(headingId) : null;
  heading?.focus({ preventScroll: true });
}

/**
 * Scrolls the panel into view, once per navigation, when the sidebar card
 * opened the tab (`GivingNavigationState`). Back, Forward and a reload replay
 * the stored history state as a POP, so those never scroll. Runs after the
 * tab's first commit, so the panel is always there to find.
 */
export function useScrollToGivingPanel(
  panelRef: RefObject<HTMLElement | null>,
) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { reducedMotion } = useMotionPrefs();
  const handledLocationKeyRef = useRef<string | null>(null);
  const navigationState = location.state as GivingNavigationState | null;
  const shouldScrollToGiving =
    navigationState?.shouldScrollToGiving === true &&
    navigationType !== NavigationType.Pop;

  useEffect(() => {
    if (!shouldScrollToGiving) return;
    if (handledLocationKeyRef.current === location.key) return;
    handledLocationKeyRef.current = location.key;
    if (panelRef.current) revealGivingPanel(panelRef.current, reducedMotion);
  }, [shouldScrollToGiving, location.key, reducedMotion, panelRef]);
}

interface PendingGivingFocusOptions {
  isEditorOpen: boolean;
  methodCount: number;
  /** Whether the Edit button is showing (an editor, loaded, with methods). */
  isEditVisible: boolean;
  /** Whether the empty state's Add button is showing. */
  isAddVisible: boolean;
  editButtonRef: RefObject<HTMLElement | null>;
  addButtonRef: RefObject<HTMLElement | null>;
  headingRef: RefObject<HTMLElement | null>;
}

/**
 * Where focus goes once the editor closes. A live save lands in the query
 * cache a tick after the editor closes, so the target waits until the method
 * count matches what was saved (or the count at close, for Cancel and
 * Discard): Edit when there are methods, else the Add button, else the
 * heading. Picking earlier would land on a control that is about to leave.
 */
export function usePendingGivingFocus({
  isEditorOpen,
  methodCount,
  isEditVisible,
  isAddVisible,
  editButtonRef,
  addButtonRef,
  headingRef,
}: PendingGivingFocusOptions) {
  const pendingFocusRef = useRef<{ expectedCount: number } | null>(null);

  useLayoutEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus || isEditorOpen) return;
    if (methodCount !== pendingFocus.expectedCount) return;
    pendingFocusRef.current = null;
    const target =
      (isEditVisible ? editButtonRef.current : null) ??
      (isAddVisible ? addButtonRef.current : null) ??
      headingRef.current;
    target?.focus();
  }, [
    isEditorOpen,
    methodCount,
    isEditVisible,
    isAddVisible,
    editButtonRef,
    addButtonRef,
    headingRef,
  ]);

  const requestFocusAfterClose = useCallback((expectedCount: number) => {
    pendingFocusRef.current = { expectedCount };
  }, []);
  const clearPendingFocus = useCallback(() => {
    pendingFocusRef.current = null;
  }, []);

  return { requestFocusAfterClose, clearPendingFocus };
}
