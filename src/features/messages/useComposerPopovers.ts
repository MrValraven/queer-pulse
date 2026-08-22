// src/features/messages/useComposerPopovers.ts
import { useEffect, useRef, useState } from "react";

export type ComposerPopover = "gif" | "shortcuts" | null;

/**
 * Mutual exclusion + outside-click/Escape dismissal for the composer's two
 * popovers (the GIF picker and the shortcut hint) — split out of `Composer`
 * to keep it under the line cap. A single `openPopover` state keeps them from
 * ever stacking two floating panels over the thread; `groupRef` is the shared
 * boundary both popover buttons/panels sit inside, so a click on either
 * toggles rather than double-firing, and a click anywhere else (the input,
 * the thread) closes whichever is open.
 */
export function useComposerPopovers() {
  const [openPopover, setOpenPopover] = useState<ComposerPopover>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPopover) return;
    function onPointerDown(event: PointerEvent) {
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setOpenPopover(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPopover(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPopover]);

  function togglePopover(which: NonNullable<ComposerPopover>) {
    setOpenPopover((current) => (current === which ? null : which));
  }

  return {
    openPopover,
    popoverGroupRef: groupRef,
    togglePopover,
    closePopover: () => setOpenPopover(null),
  };
}
