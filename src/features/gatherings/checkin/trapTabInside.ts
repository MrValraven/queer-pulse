const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The toast stack's container (see ToastProvider). */
const TOAST_REGION_SELECTOR = "[data-toast-region]";

/** The cookie consent banner's root (see ConsentBanner), present while it
 *  waits for an answer. */
const CONSENT_REGION_SELECTOR = "[data-consent-region]";

function findVisibleTabbables(root: Element): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  ).filter((element) => element.getClientRects().length > 0);
}

function findToastRegions(): Element[] {
  return Array.from(document.querySelectorAll(TOAST_REGION_SELECTOR));
}

function findConsentRegions(): Element[] {
  return Array.from(document.querySelectorAll(CONSENT_REGION_SELECTOR));
}

/** Keeps Tab and Shift+Tab cycling through the layer, the consent banner and
 *  the toast stack, so focus only lands on what the host can see: the opaque
 *  layer covers the page chrome. The banner and the toasts paint above the
 *  layer. The banner waits for an answer on a first visit, and toasts carry
 *  this tab's failures with their Retry and close buttons, so both join the
 *  cycle after the layer's own controls, in the order every other page tabs
 *  them (the banner renders ahead of the toast stack): Tab from the last layer
 *  control moves to the banner's first button, on through the toasts, and from
 *  the last of them wraps to the first layer control. Shift+Tab runs the same
 *  loop backwards. Inside one part the browser's own order stands. A modal
 *  dialog (the scanner) runs its own trap, so the layer stands aside while one
 *  is open. */
export function trapTabInside(event: KeyboardEvent, layer: HTMLElement) {
  if (event.key !== "Tab") return;
  if (document.querySelector('[aria-modal="true"]')) return;
  const parts = [layer, ...findConsentRegions(), ...findToastRegions()]
    .map((root) => ({ root, tabbables: findVisibleTabbables(root) }))
    .filter((part) => part.tabbables.length > 0);
  const cycle = parts.flatMap((part) => part.tabbables);
  const firstTabbable = cycle[0];
  const lastTabbable = cycle[cycle.length - 1];
  if (!firstTabbable || !lastTabbable) return;
  const activeElement = document.activeElement;
  const activePart =
    activeElement instanceof Node
      ? parts.find((part) => part.root.contains(activeElement))
      : undefined;
  if (!activePart || !(activeElement instanceof HTMLElement)) {
    event.preventDefault();
    (event.shiftKey ? lastTabbable : firstTabbable).focus();
    return;
  }
  // Only a part's edge needs a hand: past it, the browser would carry focus
  // to whatever sits next in the document.
  const partTabbables = activePart.tabbables;
  const edgeTabbable = event.shiftKey
    ? partTabbables[0]
    : partTabbables[partTabbables.length - 1];
  if (activeElement !== edgeTabbable) return;
  const activeIndex = cycle.indexOf(activeElement);
  const direction = event.shiftKey ? -1 : 1;
  const nextIndex = (activeIndex + direction + cycle.length) % cycle.length;
  event.preventDefault();
  cycle[nextIndex]?.focus();
}

/** Whether focus arrived from the keyboard. A tap focuses a button on Android
 *  Chrome too, and moving that focus on would raise the soft keyboard. An
 *  engine without `:focus-visible` counts as pointer focus, so it keeps the
 *  quieter behaviour. */
function isKeyboardFocus(element: HTMLElement): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
}

/** Whether `element` sits in a part that leaves the DOM on its own: a toast
 *  (auto-dismiss, close, Retry) or the consent banner (any of its answers). */
function isInsideTransientPart(element: HTMLElement): boolean {
  return (
    element.closest(`${TOAST_REGION_SELECTOR}, ${CONSENT_REGION_SELECTOR}`) !==
    null
  );
}

/** Toasts and the consent banner leave the DOM on their own, and focus on a
 *  removed button falls to the body behind the layer. While the layer is open
 *  this records the toast or banner button a keyboard user focuses and, once
 *  it is gone, hands focus to `getFallback()` (the search field). Any other
 *  focus clears the record. Returns the cleanup. */
export function returnFocusFromRemovedParts(
  getFallback: () => HTMLElement | null | undefined,
): () => void {
  let focusedPartElement: HTMLElement | null = null;
  // The banner unmounts its whole root, so the watch covers the body: a
  // region's own subtree never reports its removal. It runs only while a
  // record exists, so guest rows rendering in the layer stay unobserved.
  const observer = new MutationObserver(() => {
    if (!focusedPartElement || focusedPartElement.isConnected) return;
    clearRecord();
    const activeElement = document.activeElement;
    if (activeElement === null || activeElement === document.body) {
      getFallback()?.focus();
    }
  });
  const clearRecord = () => {
    focusedPartElement = null;
    observer.disconnect();
  };
  const handleFocusIn = (event: FocusEvent) => {
    const target = event.target;
    const isKeyboardFocusInPart =
      target instanceof HTMLElement &&
      isInsideTransientPart(target) &&
      isKeyboardFocus(target);
    if (!isKeyboardFocusInPart) {
      clearRecord();
      return;
    }
    if (!focusedPartElement) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    focusedPartElement = target;
  };
  document.addEventListener("focusin", handleFocusIn);
  return () => {
    document.removeEventListener("focusin", handleFocusIn);
    clearRecord();
  };
}
