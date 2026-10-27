import { findMainLandmark } from "../../../../app/mainLandmarkFocus";

/** Marks the element focus was handed to, so the gate's stylesheet can draw
 *  the focus ring even though the move came from a pointer press. */
export const SESSION_END_FOCUS_ATTRIBUTE = "data-session-end-focus";

function isFocusLost(): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement === null ||
    activeElement === document.body ||
    !activeElement.isConnected
  );
}

/**
 * Skip on the gate can end the session, which takes the player bar (and the
 * play button focus was handed to) off the page. Once that render has
 * landed, focus that fell to `<body>` moves to the page's main heading, or
 * to the `<main>` landmark when the page has none. Focus that still sits on
 * a real element is left alone.
 */
export function restoreFocusAfterSessionEnd(): void {
  window.requestAnimationFrame(() => {
    if (!isFocusLost()) return;
    const main = findMainLandmark();
    const target = main?.querySelector<HTMLElement>("h1") ?? main;
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.setAttribute(SESSION_END_FOCUS_ATTRIBUTE, "");
    target.addEventListener(
      "blur",
      () => target.removeAttribute(SESSION_END_FOCUS_ATTRIBUTE),
      { once: true },
    );
    target.focus({ preventScroll: true });
  });
}
