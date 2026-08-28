import { useEffect, useId, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

/** How long the panel takes to open, matching `.wrap`'s transition. The clip
 *  is lifted once it has run, so a Select inside can hang past the panel. */
const OPEN_MS = 300;

/**
 * The open/closed state behind a "Refine" toggle and the panel it reveals.
 *
 * A filter bar's job is to stay one row tall until someone asks for more, so
 * every group lives in a drawer and the bar keeps only what is always needed:
 * the search field, and whatever else belongs on that line. The choice sticks
 * per device, so a member who works with the drawer open keeps it open.
 *
 * The panel clips its overflow to animate its own height without measuring
 * (a 1-row grid easing between 0fr and 1fr). That clip would also crop a
 * `Select` panel opening inside it, so it is lifted once the drawer has
 * settled and restored the instant either direction starts. `overflow` cannot
 * be animated, which is why this is state rather than CSS.
 */
export function useRefineDrawer(storageKey: string) {
  const [isOpen, setIsOpen] = useLocalStorage(storageKey, false);
  const [isSettled, setIsSettled] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => setIsSettled(true), OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const toggle = () => {
    setIsSettled(false);
    setIsOpen((open) => !open);
  };

  return {
    isOpen,
    toggle,
    /** Spread onto `<RefineToggle>`. */
    toggleProps: { isOpen, panelId, onToggle: toggle },
    /** Spread onto `<RefinePanel>`. */
    panelProps: { isOpen, isSettled, panelId },
  };
}
