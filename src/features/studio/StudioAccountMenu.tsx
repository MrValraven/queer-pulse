import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLocation } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useNavDrawerFocus } from "../../shared/components/layout/useNavDrawerFocus";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  useExitTransition,
  useMediaQuery,
  useOutsideDismiss,
} from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { StudioAccountMenuPanel } from "./StudioAccountMenuPanel";
import { StudioNavSheet } from "./StudioNavSheet";
import styles from "./StudioAccountMenu.module.css";

/** How long the panel lingers to fade out after a dismissal, ms. Mirrors the
 *  `.panelClosing` animation in StudioAccountMenu.module.css. */
const MENU_EXIT_MS = 90;
/** How long the side sheet lingers to slide out after a dismissal, ms.
 *  Mirrors the `.rootClosing` animations in StudioNavSheet.module.css. */
const SHEET_EXIT_MS = 200;
/** The width at and below which the listener shell's avatar opens the side
 *  sheet. Matches `--compact`, where the rail hides. */
const SHEET_MAX_WIDTH = 880;

/**
 * Open state for the avatar's surface, dropdown or side sheet. Dismissals
 * play the surface's leave animation, a row that navigates unmounts at once,
 * and reduced motion skips the animation on every path. In sheet mode any
 * change of page closes the sheet, as a safety net for links outside its own
 * rows. Crossing the sheet breakpoint closes whichever surface is open
 * (`previousIsSheetMode`). The listener shell also mounts the menu in a
 * different slot on each side of 880px, so there the crossing remounts the
 * whole menu as well; its media query and this one can commit in either
 * order, and useTriggerFocusAcrossSlots carries focus to the new avatar.
 */
function useStudioAccountSurface(isSheetMode: boolean) {
  const { reducedMotion } = useMotionPrefs();
  const location = useLocation();
  const locationKey = `${location.pathname}${location.search}`;
  const [isOpen, setIsOpen] = useState(false);
  const [exitMs, setExitMs] = useState(0);
  const [previousIsSheetMode, setPreviousIsSheetMode] = useState(isSheetMode);
  const [previousLocationKey, setPreviousLocationKey] = useState(locationKey);

  // Adjusted during render, as useExitTransition does, so the surface that
  // no longer fits never paints a frame.
  if (previousIsSheetMode !== isSheetMode) {
    setPreviousIsSheetMode(isSheetMode);
    setExitMs(0);
    setIsOpen(false);
  }
  if (previousLocationKey !== locationKey) {
    setPreviousLocationKey(locationKey);
    if (isSheetMode) {
      setExitMs(0);
      setIsOpen(false);
    }
  }

  const { isMounted, isExiting } = useExitTransition(isOpen, exitMs);

  const dismiss = useCallback(() => {
    const leaveMs = isSheetMode ? SHEET_EXIT_MS : MENU_EXIT_MS;
    setExitMs(reducedMotion ? 0 : leaveMs);
    setIsOpen(false);
  }, [reducedMotion, isSheetMode]);

  const closeForNavigation = useCallback(() => {
    setExitMs(0);
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) dismiss();
    else setIsOpen(true);
  }, [isOpen, dismiss]);

  return { isOpen, isMounted, isExiting, dismiss, closeForNavigation, toggle };
}

/** Set when a menu unmounts holding focus or an open surface, for the
 *  instance the shell mounts in its other slot within the same commit.
 *  Cleared on the next microtask, so a later mount elsewhere never reads it. */
let shouldFocusNextTrigger = false;

/**
 * Keeps focus on the avatar when the listener shell swaps the menu between
 * its topbar slots (a rotation across 880px). The handoff runs in layout
 * effects, while the old wrapper is still in the document and the new one
 * mounts in the same commit. The focus itself waits for a passive effect, so
 * it lands after the sheet's trap has restored focus to the removed avatar.
 */
function useTriggerFocusAcrossSlots(
  isOpen: boolean,
  wrapRef: RefObject<HTMLDivElement | null>,
  triggerRef: RefObject<HTMLButtonElement | null>,
) {
  const isOpenRef = useRef(isOpen);
  const shouldFocusOnMountRef = useRef(false);
  useLayoutEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  useLayoutEffect(() => {
    if (shouldFocusNextTrigger) {
      shouldFocusNextTrigger = false;
      shouldFocusOnMountRef.current = true;
    }
    const wrap = wrapRef.current;
    return () => {
      const isHoldingFocus = wrap?.contains(document.activeElement) ?? false;
      if (!isOpenRef.current && !isHoldingFocus) return;
      shouldFocusNextTrigger = true;
      queueMicrotask(() => {
        shouldFocusNextTrigger = false;
      });
    };
  }, [wrapRef]);
  useEffect(() => {
    if (!shouldFocusOnMountRef.current) return;
    shouldFocusOnMountRef.current = false;
    triggerRef.current?.focus();
  }, [triggerRef]);
}

/**
 * The avatar of both Studio shells, opening the Studio profile menu. Behaves
 * like the app's AccountMenu: an outside press or Escape dismisses with a
 * short fade (Escape hands focus back to the trigger), a row that navigates
 * unmounts the panel at once, and reduced motion skips the fade on every
 * path. With `isSheetOnCompact`, at 880px and below the avatar opens the
 * phone side sheet (StudioNavSheet), which runs its own focus trap.
 */
export function StudioAccountMenu({
  triggerLabel,
  persona = null,
  className,
  isSheetOnCompact = false,
}: {
  /** The trigger's accessible name. */
  triggerLabel: string;
  /** The creator shell's active persona: the trigger shows it, and the
   *  header names it as the uploading identity. */
  persona?: StudioArtistRefView | null;
  /** Extra class on the wrapper, for the shell's own placement rules. */
  className?: string;
  /** Opens the side sheet at 880px and below (the listener shell). */
  isSheetOnCompact?: boolean;
}) {
  const identity = useAccountIdentity();
  const isCompact = useMediaQuery(mediaMax(SHEET_MAX_WIDTH));
  const isSheetMode = isSheetOnCompact && isCompact;
  const {
    isOpen,
    isMounted,
    isExiting,
    dismiss: dismissMenu,
    closeForNavigation: closeMenuForNavigation,
    toggle: toggleMenu,
  } = useStudioAccountSurface(isSheetMode);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useTriggerFocusAcrossSlots(isOpen, wrapRef, triggerRef);

  // The sheet portals to <body>, so the dropdown's outside press would read
  // every press inside it as outside. The sheet gets the nav drawer's trap,
  // which also closes on Escape and hands focus back to the avatar.
  useNavDrawerFocus({
    isOpen: isOpen && isSheetMode,
    panelRef: sheetRef,
    onClose: dismissMenu,
  });
  useOutsideDismiss(isOpen && !isSheetMode, wrapRef, dismissMenu, {
    onEscape: () => {
      dismissMenu();
      triggerRef.current?.focus();
    },
  });

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      ref={wrapRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        data-sheet-mode={isSheetMode || undefined}
        onClick={toggleMenu}
        aria-haspopup={isSheetMode ? "dialog" : undefined}
        aria-expanded={isOpen}
        aria-controls={isMounted ? panelId : undefined}
        aria-label={triggerLabel}
      >
        <Avatar
          initials={persona?.initials ?? identity.initials}
          src={persona?.avatarUrl ?? identity.photo}
          size={34}
          alt=""
        />
      </button>

      {isMounted &&
        (isSheetMode ? (
          <StudioNavSheet
            id={panelId}
            panelRef={sheetRef}
            persona={persona}
            isExiting={isExiting}
            onClose={dismissMenu}
            onNavigate={closeMenuForNavigation}
          />
        ) : (
          <StudioAccountMenuPanel
            id={panelId}
            isExiting={isExiting}
            persona={persona}
            onNavigate={closeMenuForNavigation}
          />
        ))}
    </div>
  );
}
