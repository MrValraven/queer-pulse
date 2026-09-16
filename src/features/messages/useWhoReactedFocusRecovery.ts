// src/features/messages/useWhoReactedFocusRecovery.ts
import { useEffect, useRef, type RefObject } from "react";

type FocusRegion = "tabs" | "panel";

/**
 * Keeps focus inside the "who reacted" sheet (PRD-352) when the element holding
 * it unmounts. The viewer's own "Tap to remove" button leaves with its row once
 * the refetched list lands, and a reaction tab leaves when its count reaches 0.
 * Left alone, focus falls to `body`; the Modal's Tab trap only wraps from its
 * first or last focusable, so the next Tab would walk into the page behind the
 * sheet and a screen reader would lose its place.
 *
 * Remembers which region last held focus. After any commit that leaves focus
 * on `body`, it moves focus to the selected tab (when a tab vanished) or to the
 * tab panel, which `tabPanelProps` makes focusable (when a row's button
 * vanished). Focus the member moved somewhere on purpose is never touched: only
 * a fall to `body` counts.
 */
export function useWhoReactedFocusRecovery(
  tablistRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
) {
  const lastFocusedRegionRef = useRef<FocusRegion | null>(null);

  // No dependency list on purpose: the focused element can unmount in any
  // commit (a refetch, a count reaching 0), and the check is two reads.
  useEffect(() => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) return;
    if (lastFocusedRegionRef.current === "tabs") {
      tablistRef.current
        ?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
        ?.focus();
    } else if (lastFocusedRegionRef.current === "panel") {
      panelRef.current?.focus();
    }
  });

  return {
    onTabsFocus: () => {
      lastFocusedRegionRef.current = "tabs";
    },
    onPanelFocus: () => {
      lastFocusedRegionRef.current = "panel";
    },
  };
}
