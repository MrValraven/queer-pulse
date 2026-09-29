import { useRef, type RefObject } from "react";

/**
 * Guards a group of buttons where pressing one can remove it from the DOM
 * (a chip that drops out once it is switched off, a "Clear" that empties the
 * whole row): once that removal unmounts the pressed button, the browser
 * drops focus to `<body>`, stranding a keyboard or screen reader user at the
 * top of the page.
 *
 * `keepFocusInGroup` wraps a click handler: it runs the handler, then checks
 * focus once the resulting render has committed. A stranded focus (the
 * `<body>`, or nothing) is handed to the first button still standing inside
 * the group, or the group element itself as a last resort.
 */
export function useFocusRecoveryInGroup<Element extends HTMLElement>(): {
  groupRef: RefObject<Element | null>;
  keepFocusInGroup: (run: () => void) => () => void;
} {
  const groupRef = useRef<Element>(null);

  const keepFocusInGroup = (run: () => void) => () => {
    run();
    requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (focused !== null && focused !== document.body) return;
      const firstButton = groupRef.current?.querySelector("button");
      if (firstButton instanceof HTMLElement) firstButton.focus();
      else groupRef.current?.focus();
    });
  };

  return { groupRef, keepFocusInGroup };
}
