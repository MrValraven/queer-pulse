import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useScrollLock } from "../../hooks";
import { pushModal, popModal, isTopmostModal } from "./modalStack";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus returns held over from dialogs that closed underneath another one.
 * The chat image viewer is the case: Forward opens the forward picker and
 * starts the viewer's exit in the same render, so the viewer unmounts about
 * 180ms later while the member is already typing in the picker. That viewer
 * leaves focus in the picker and parks its own return target here. The
 * picker's opener was the viewer's Forward button, gone with the viewer, so
 * when the picker closes its return resolves through this list to the photo
 * that opened the viewer. Capped, since an entry is only read back when a
 * dialog on top closes after the one underneath.
 */
const parkedFocusReturns: { dialog: HTMLElement; target: HTMLElement }[] = [];
const PARKED_FOCUS_RETURN_LIMIT = 4;

/** Follows a return target that went away with a dialog that closed
 *  underneath to the target that dialog parked, through any chain of them. */
function resolveFocusReturn(target: HTMLElement | null): HTMLElement | null {
  if (!target || target.isConnected) return target;
  const parkedIndex = parkedFocusReturns.findIndex(({ dialog }) =>
    dialog.contains(target),
  );
  if (parkedIndex === -1) return target;
  const [parkedReturn] = parkedFocusReturns.splice(parkedIndex, 1);
  return resolveFocusReturn(parkedReturn?.target ?? null);
}

/**
 * Sends focus back to the control that opened `dialog` as it closes. When
 * focus sits inside any other connected `aria-modal="true"` dialog at that
 * moment (in practice one opened on top while this one played its exit),
 * focus stays there, and the return target is parked for a later close whose
 * own opener went away inside this dialog.
 */
function returnFocusOnClose(
  dialog: HTMLElement | null,
  previouslyFocused: HTMLElement | null,
): void {
  const focusReturn = resolveFocusReturn(previouslyFocused);
  const activeElement = document.activeElement;
  const isFocusInAnotherDialog =
    activeElement instanceof HTMLElement &&
    activeElement.isConnected &&
    !dialog?.contains(activeElement) &&
    activeElement.closest('[aria-modal="true"]') !== null;
  if (!isFocusInAnotherDialog) {
    focusReturn?.focus?.();
    return;
  }
  if (!dialog || !focusReturn || focusReturn === activeElement) return;
  parkedFocusReturns.push({ dialog, target: focusReturn });
  if (parkedFocusReturns.length > PARKED_FOCUS_RETURN_LIMIT)
    parkedFocusReturns.shift();
}

/**
 * Modal a11y for both variants: scroll-lock, Escape-to-close, an initial focus
 * into the dialog, a Tab focus-trap so keyboard/screen-reader users can't tab
 * out to the inert page behind, and focus restore to the trigger on close.
 * Returns a ref to attach to the dialog container. Mount the modal only while
 * open (self-contained modals own their state), so this runs per open.
 *
 * `preferredInitialFocusRef` overrides the default "first focusable inside"
 * rule (which is ordinarily the head's close button, since it renders before
 * the body/footer in DOM order): a caller that needs a SPECIFIC control to
 * open with focus (e.g. the safer of two footer actions) passes a ref to it
 * here, so nothing has to move focus again afterwards. Omit it and nothing
 * changes: the existing "first focusable, else the dialog itself" rule still
 * applies exactly as before.
 */
export function useDismiss<ElementType extends HTMLElement = HTMLDivElement>(
  onClose: () => void,
  preferredInitialFocusRef?: { current: HTMLElement | null },
) {
  // Generic so a dialog that is semantically something other than a div can
  // still use it: AdminDrawer's container is an <aside>, and weakening that to
  // a div just to satisfy the ref type would lose the landmark.
  const dialogRef = useRef<ElementType>(null);
  // Stable per-instance id so this dialog can register itself on the shared
  // modal stack (see `./modalStack`) and only act on Escape while topmost.
  const modalId = useId();
  // Latest-callback ref so the setup effect can run once on mount (deps `[]`)
  // without an inline `onClose` re-running the focus-trap + initial focus on
  // every parent render, which would yank focus back mid-interaction.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useScrollLock();

  useEffect(() => {
    pushModal(modalId);
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null,
          )
        : [];

    // Initial focus: the caller's preferred control when given and actually
    // rendered, else the first focusable inside, else the dialog itself.
    const preferred = preferredInitialFocusRef?.current;
    if (preferred) preferred.focus();
    else {
      const first = focusables()[0];
      if (first) first.focus();
      else dialog?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only the topmost dialog dismisses. A lone dialog is always
        // topmost, so single-modal behavior is unchanged; a dialog opened
        // from inside another (e.g. a confirm dialog in a drawer's footer)
        // no longer closes both on one Escape press.
        if (isTopmostModal(modalId)) {
          // Marks the key as spent for every listener after this one (a page
          // layer on `window`, such as check-in focus mode). By the time they
          // run, React may already have unmounted this dialog, so they cannot
          // tell from the DOM that a dialog took this press.
          e.preventDefault();
          onCloseRef.current();
        }
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = focusables();
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const active = document.activeElement;
      if (e.shiftKey && (active === firstEl || active === dialog)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      popModal(modalId);
      document.removeEventListener("keydown", onKey);
      returnFocusOnClose(dialog, previouslyFocused);
    };
  }, [modalId, preferredInitialFocusRef]);

  return dialogRef;
}

/**
 * Backdrop-dismiss props for a scrim, safe against text-selection drags.
 *
 * A `click` event's target is the nearest common ancestor of the `mousedown`
 * and the `mouseup` elements, so dragging to select text inside a dialog and
 * releasing a few pixels past its edge fires a click whose target IS the scrim.
 * A `target === currentTarget` test alone therefore closes the dialog and
 * throws away whatever the member had typed into it. Requiring the pointer to
 * have gone DOWN on the scrim as well makes "click the backdrop" mean what it
 * looks like.
 *
 * Spread onto the scrim element: `<div className={scrim} {...scrimProps} />`.
 */
export function useScrimDismiss(onClose: () => void): {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
} {
  const didPressScrim = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    didPressScrim.current = event.target === event.currentTarget;
  }, []);

  const onClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    const wasPressOnScrim = didPressScrim.current;
    didPressScrim.current = false;
    if (event.target === event.currentTarget && wasPressOnScrim) {
      onCloseRef.current();
    }
  }, []);

  return useMemo(() => ({ onPointerDown, onClick }), [onPointerDown, onClick]);
}
