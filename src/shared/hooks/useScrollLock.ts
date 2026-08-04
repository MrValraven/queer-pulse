import { useEffect } from "react";

/**
 * Prevents the page behind a modal from scrolling.
 *
 * iOS Safari ignores `body { overflow: hidden }` for touch scrolling, so the
 * page rubber-bands behind modals and sheets. The robust cross-platform fix is
 * to take the body out of flow with `position: fixed` and offset it by the
 * current scroll position, then restore both on unlock. We keep the
 * scrollbar-width compensation (so desktop content doesn't shift when the
 * scrollbar disappears) and a shared reference count so several stacked modals
 * don't fight over the body styles — only the last unlock restores.
 */
let lockCount = 0;
let savedScrollY = 0;
let savedOverflow = "";
let savedPosition = "";
let savedTop = "";
let savedLeft = "";
let savedRight = "";
let savedWidth = "";
let savedPaddingRight = "";

function engage() {
  if (lockCount === 0) {
    const body = document.body;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    savedScrollY = window.scrollY;
    savedOverflow = body.style.overflow;
    savedPosition = body.style.position;
    savedTop = body.style.top;
    savedLeft = body.style.left;
    savedRight = body.style.right;
    savedWidth = body.style.width;
    savedPaddingRight = body.style.paddingRight;

    // Pin the body to the viewport at its current scroll offset. Unlike
    // `overflow: hidden`, iOS Safari honours this and stops touch scrolling
    // rubber-banding the page behind the modal.
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      const currentPaddingRight =
        parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const body = document.body;
    body.style.overflow = savedOverflow;
    body.style.position = savedPosition;
    body.style.top = savedTop;
    body.style.left = savedLeft;
    body.style.right = savedRight;
    body.style.width = savedWidth;
    body.style.paddingRight = savedPaddingRight;
    // Restore the scroll position the lock froze — `position: fixed` reset it
    // to the top. Skips the browser's smooth-scroll so it's instant.
    window.scrollTo(0, savedScrollY);
  }
}

/**
 * Whether the body is currently held by the scroll lock. Consumers that record
 * `window.scrollY` (e.g. ScrollManager) MUST skip while this is true: pinning
 * the body to `position: fixed` collapses the window to scrollY 0 and fires a
 * spurious `scroll` event, which would otherwise stamp 0 over the entry's real
 * remembered offset — and a later POP restore would then jump the page to the top.
 */
export function isScrollLocked() {
  return lockCount > 0;
}

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    engage();
    return release;
  }, [active]);
}
