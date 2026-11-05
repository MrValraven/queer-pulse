import { useCallback } from "react";

/**
 * A callback ref for the first element inside a shared `<Modal>` that turns
 * the whole dialog dark. The Modal portals to `<body>`, outside the studio's
 * own `data-theme="dark"` root, and it takes no theme prop, so without this a
 * dialog opened from the dark studio would paint with the app's light tokens.
 * Stamping the attribute on the dialog element makes every token and every
 * `[data-theme="dark"] .thing` rule inside it read as dark. React never
 * manages that attribute, so it survives re-renders.
 */
export function useQuizshowDarkDialog() {
  return useCallback((anchor: HTMLElement | null) => {
    anchor?.closest('[role="dialog"]')?.setAttribute("data-theme", "dark");
  }, []);
}
