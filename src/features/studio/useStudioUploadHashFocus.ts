import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";
import { focusFieldById } from "./studioUploadFocus";

const RELEASE_FIELD_ID_SET: ReadonlySet<string> = new Set(
  Object.values(RELEASE_FIELD_IDS),
);

/** How long after the hash is read a field may still take focus. */
export const HASH_FOCUS_WAIT_MS = 5000;

/** How long after focus lands the page gets to settle (panels opening,
 *  their height animations measuring) before the field is checked once more
 *  and scrolled back into view if the page ended up elsewhere. */
export const HASH_FOCUS_SETTLE_MS = 400;

/** The landing scroll jumps straight to the field. A smooth scroll is still
 *  moving when a height animation on the page measures itself and puts the
 *  scroll position back, which leaves the page at the top. */
const LANDING_SCROLL_BEHAVIOR: ScrollBehavior = "instant";

/** The address hash without its `#`, decoded. A malformed escape reads as
 *  no hash at all. */
function decodedHashOf(hash: string): string {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return "";
  }
}

/** The release field the hash names, or null when it names none. */
function releaseFieldIdOf(hash: string): string | null {
  const fieldId = decodedHashOf(hash);
  return RELEASE_FIELD_ID_SET.has(fieldId) ? fieldId : null;
}

/**
 * Focuses the release field the hash names once it is on the page; anything
 * else is ignored. A dashboard checklist link (`#studio-release-genre`)
 * lands on its field once the step renders it, and focus moves only once, so
 * later renders leave focus where the member put it. A field that renders
 * deeper down without this component rendering again (a track's details
 * panel loading its track) is caught by watching the page until it shows up.
 * The member's first press or key ends the wait, and so does
 * `HASH_FOCUS_WAIT_MS` after the hash was read.
 *
 * Once focus lands, the page settles for `HASH_FOCUS_SETTLE_MS`, and then
 * the field is scrolled back into view once if it ended up off screen. The
 * same press, key, deadline or unmount that ends the wait ends that check,
 * and it never scrolls to a field that no longer has focus.
 */
export function useStudioUploadHashFocus(): void {
  const { hash } = useLocation();
  const pendingFieldIdRef = useRef<string | null>(null);
  const landedFieldIdRef = useRef<string | null>(null);
  const waitEndsAtRef = useRef(0);
  const settleCheckAtRef = useRef(0);
  // Declared first, so a new hash is pending before the focus effect reads it.
  useEffect(() => {
    pendingFieldIdRef.current = releaseFieldIdOf(hash);
    landedFieldIdRef.current = null;
    waitEndsAtRef.current = Date.now() + HASH_FOCUS_WAIT_MS;
  }, [hash]);
  useEffect(() => {
    const remainingMs = waitEndsAtRef.current - Date.now();
    if (remainingMs <= 0) {
      pendingFieldIdRef.current = null;
      landedFieldIdRef.current = null;
      return;
    }
    // Answers whether focus landed, and starts the settle clock when it did.
    // The clock lives in a ref, so a render never pushes the check later.
    const landFocus = (fieldId: string): boolean => {
      if (!tryFocusField(fieldId)) return false;
      pendingFieldIdRef.current = null;
      landedFieldIdRef.current = fieldId;
      settleCheckAtRef.current = Date.now() + HASH_FOCUS_SETTLE_MS;
      return true;
    };
    const pendingFieldId = pendingFieldIdRef.current;
    if (pendingFieldId) landFocus(pendingFieldId);
    if (!pendingFieldIdRef.current && !landedFieldIdRef.current) return;
    let settleTimer: number | undefined;
    const scheduleSettleCheck = () => {
      const settleInMs = Math.max(0, settleCheckAtRef.current - Date.now());
      settleTimer = window.setTimeout(() => {
        const landedFieldId = landedFieldIdRef.current;
        landedFieldIdRef.current = null;
        stopWaiting();
        if (landedFieldId) scrollBackIfOffScreen(landedFieldId);
      }, settleInMs);
    };
    const observer = new MutationObserver(() => {
      const fieldId = pendingFieldIdRef.current;
      if (!fieldId || !landFocus(fieldId)) return;
      observer.disconnect();
      scheduleSettleCheck();
    });
    // The member's own first press or key wins: a field that shows up
    // after it never pulls focus away from what they started, and a field
    // they already moved on from is never scrolled back to. The deadline
    // ends the wait for a field that never takes focus.
    const cancelPendingFocus = () => {
      pendingFieldIdRef.current = null;
      landedFieldIdRef.current = null;
      stopWaiting();
    };
    const deadline = window.setTimeout(cancelPendingFocus, remainingMs);
    function stopWaiting() {
      observer.disconnect();
      window.clearTimeout(deadline);
      window.clearTimeout(settleTimer);
      document.removeEventListener("pointerdown", cancelPendingFocus, true);
      document.removeEventListener("keydown", cancelPendingFocus, true);
    }
    if (landedFieldIdRef.current) {
      scheduleSettleCheck();
    } else {
      // `inert` too: a panel that finishes opening drops it and can then
      // focus.
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["inert"],
      });
    }
    document.addEventListener("pointerdown", cancelPendingFocus, true);
    document.addEventListener("keydown", cancelPendingFocus, true);
    return stopWaiting;
  });
}

/** Tries focus without scrolling and answers whether it landed. Only a
 *  landed focus scrolls the field into view (through `focusFieldById`), so a
 *  field that refuses focus (disabled, or still inert while its panel
 *  opens) never pulls the page back while the member scrolls. */
function tryFocusField(fieldId: string): boolean {
  const field = document.getElementById(fieldId);
  if (!field) return false;
  field.focus({ preventScroll: true });
  if (document.activeElement !== field) return false;
  return focusFieldById(fieldId, undefined, {
    behavior: LANDING_SCROLL_BEHAVIOR,
  });
}

/** Scrolls the landed field back into view when the settled page left its
 *  top edge off screen, and only while it still has focus. */
function scrollBackIfOffScreen(fieldId: string): void {
  const field = document.getElementById(fieldId);
  if (!field || document.activeElement !== field) return;
  const { top } = field.getBoundingClientRect();
  const isTopOnScreen = top >= 0 && top < window.innerHeight;
  if (isTopOnScreen) return;
  field.scrollIntoView?.({
    block: "center",
    behavior: LANDING_SCROLL_BEHAVIOR,
  });
}

/** True while the address asks for a track's credits (read by the file
 *  list, which opens the first track's details panel for them). */
export function useIsTrackCreditsRequested(): boolean {
  const { hash } = useLocation();
  return decodedHashOf(hash) === RELEASE_FIELD_IDS.trackCredits;
}
