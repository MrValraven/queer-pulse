// src/features/messages/useComposerPopovers.ts
import { useEffect, useRef, useState } from "react";

export type ComposerPopover = "attach" | "gif" | "shortcuts" | null;

/**
 * Mutual exclusion + outside-click/Escape dismissal for the composer's three
 * popovers (the attach menu, the GIF picker it hands off to, and the shortcut
 * hint) — split out of `Composer` to keep it under the line cap. A single
 * `openPopover` state keeps them from ever stacking two floating panels over
 * the thread; `groupRef` is the shared boundary every popover button/panel
 * sits inside, so a click on any of them toggles rather than double-firing,
 * and a click anywhere else (the thread, the page) closes whichever is open.
 *
 * The boundary is now the input pill itself, which CONTAINS the textarea —
 * so an outside-click no longer fires when someone taps into the field.
 * `ComposerInputRow` closes on textarea focus instead, preserving the "start
 * typing and the panel gets out of the way" feel it had when the controls
 * still sat outside the input.
 */
export function useComposerPopovers() {
  const [openPopover, setOpenPopover] = useState<ComposerPopover>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPopover) return;
    function onPointerDown(event: PointerEvent) {
      if (
        groupRef.current &&
        !groupRef.current.contains(event.target as Node)
      ) {
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

  /** Unconditional open — the attach menu's GIF row hands off to the picker,
   *  and a toggle there would close it instead whenever the picker was
   *  somehow already the open panel. */
  function openPopoverExclusively(which: NonNullable<ComposerPopover>) {
    setOpenPopover(which);
  }

  return {
    openPopover,
    popoverGroupRef: groupRef,
    togglePopover,
    showPopover: openPopoverExclusively,
    closePopover: () => setOpenPopover(null),
  };
}
