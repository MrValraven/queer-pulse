import { useEffect, useRef, useState, type RefObject } from "react";
import { isListingAnchor } from "./listingPreviewRegions.data";

/** The nearest field anchor at or above `target`, stopping at `container`. */
function anchorAt(
  target: EventTarget | null,
  container: HTMLElement,
): string | null {
  let node = target instanceof Element ? target : null;
  while (node && node !== container) {
    if (node.id && isListingAnchor(node.id)) return node.id;
    node = node.parentElement;
  }
  return null;
}

/** Controls and their labels: what a pointer can act on, as opposed to the
 *  blank gaps between fields. */
const INTERACTIVE_SELECTOR =
  "input, textarea, select, button, label, a, [role]";

/**
 * Whether `target` is (or sits inside) a control within `container`. Called
 * once `anchorAt` found no field around it, so such a control is one the
 * preview has no spot for (the pricing-mode switch, "Temporarily closed").
 */
function isOverUnmappedControl(
  target: EventTarget | null,
  container: HTMLElement,
): boolean {
  if (!(target instanceof Element)) return false;
  const control = target.closest(INTERACTIVE_SELECTOR);
  return (
    control !== null && control !== container && container.contains(control)
  );
}

/**
 * The trigger in `container` whose open popup holds `target`, found through
 * the trigger's `aria-expanded` + `aria-controls` pair, or null. The time and
 * date pickers in the hours fields portal their popover to the body and move
 * focus into it, so focus there still belongs to the field.
 */
function openPopupTriggerOf(
  target: Element,
  container: HTMLElement,
): Element | null {
  const triggers = container.querySelectorAll(
    '[aria-expanded="true"][aria-controls]',
  );
  return (
    Array.from(triggers).find((trigger) =>
      (trigger.getAttribute("aria-controls") ?? "")
        .split(/\s+/)
        .some(
          (popupId) =>
            popupId !== "" &&
            document.getElementById(popupId)?.contains(target) === true,
        ),
    ) ?? null
  );
}

/** The field anchors the hook reports, as ANCHOR ids or null. */
export interface FocusedListingField {
  /** The field the member is on: the focused one wins, else the hovered one.
   *  Drives the caption and outline. */
  activeAnchor: string | null;
  /** The focused field alone. A mouse user hovers a field before clicking
   *  it, so `activeAnchor` often holds that field before focus arrives; this
   *  one changes the moment focus lands, which is what scrolling keys on. */
  focusedAnchor: string | null;
}

/** Tracks which field inside `containerRef` the member is focused on or
 *  hovering, by the field's ANCHOR id. */
export function useFocusedListingField(
  containerRef: RefObject<HTMLElement | null>,
): FocusedListingField {
  const [focusedAnchor, setFocusedAnchor] = useState<string | null>(null);
  const [hoveredAnchor, setHoveredAnchor] = useState<string | null>(null);
  // Mirrors of the state, so a listener only schedules a render on a change.
  const focusedRef = useRef<string | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // The caller can swap the element behind the same ref (the owner editor
  // renders a sending panel while it saves, then a fresh layout after a
  // failed save), so re-read it after every render and let the listeners
  // below follow it. An unchanged element is a no-op state update, which is
  // why running without a dependency list cannot loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setContainer(containerRef.current);
  });

  useEffect(() => {
    if (!container) return;

    const setFocused = (anchor: string | null) => {
      if (focusedRef.current === anchor) return;
      focusedRef.current = anchor;
      setFocusedAnchor(anchor);
    };
    const setHovered = (anchor: string | null) => {
      if (hoveredRef.current === anchor) return;
      hoveredRef.current = anchor;
      setHoveredAnchor(anchor);
    };

    let pendingCheck: number | undefined;

    const onFocusIn = (event: FocusEvent) => {
      window.clearTimeout(pendingCheck);
      setFocused(anchorAt(event.target, container));
    };

    // Where focus settled once a focusout has run its course: back in the
    // form (take that field), inside a popup one of its fields opened (keep
    // the field), or anywhere else (clear).
    const settleFocus = () => {
      const active = document.activeElement;
      if (active && container.contains(active)) {
        setFocused(anchorAt(active, container));
      } else if (!active || openPopupTriggerOf(active, container) === null) {
        setFocused(null);
      }
    };

    // Listened for on the document, because a portalled popup's focusout never
    // bubbles through the container: leaving the time picker for somewhere
    // else must still clear the highlight. The check waits a tick so that
    // `relatedTarget` gaps (a button Safari will not focus, a focused node
    // being removed) have settled into `document.activeElement`.
    const onFocusOut = () => {
      if (focusedRef.current === null) return;
      window.clearTimeout(pendingCheck);
      pendingCheck = window.setTimeout(settleFocus, 0);
    };

    // A field sets the hover anchor and a control the preview has no spot
    // for clears it, so its caption never names the field last passed.
    // Crossing the blank gaps between fields keeps the last one, so the
    // outline does not flicker, and leaving the container clears it.
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const anchor = anchorAt(event.target, container);
      if (anchor !== null) setHovered(anchor);
      else if (isOverUnmappedControl(event.target, container)) {
        setHovered(null);
      }
    };
    const onPointerLeave = () => setHovered(null);

    container.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.clearTimeout(pendingCheck);
      container.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      container.removeEventListener("pointerover", onPointerOver);
      container.removeEventListener("pointerleave", onPointerLeave);
      // Whatever the old element had in focus or under the mouse is gone.
      setFocused(null);
      setHovered(null);
    };
  }, [container]);

  return { activeAnchor: focusedAnchor ?? hoveredAnchor, focusedAnchor };
}
