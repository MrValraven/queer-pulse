import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import type { EditorPaneKey } from "./editorRail.data";
import { useSubprofileEditorNav } from "./subprofileEditorNav";

/** How long the "look here" ring stays on a jumped-to field. Long enough to
 *  find after the scroll settles, short enough not to read as an error state. */
const FLASH_MS = 1500;

/** Global class (persona-editor.css) carrying the flash animation. Applied to
 *  the `FormField` wrapper by id, so it can't live in a CSS module. */
const FLASH_CLASS = "ed-field-flash";

export interface EditorFieldTarget {
  /** Rail pane holding the field. */
  pane: EditorPaneKey;
  /** `FIELD_ANCHOR_ID` values to scroll to and flash, in order. The first one
   *  present in the DOM is what gets scrolled to; every one present flashes. */
  anchors: string[];
}

/**
 * The ONE "take me to that field" mechanism for the persona editor: open the
 * pane a field lives on, glide to it, and flash a ring around it so the eye
 * lands in the right place. Used by the publish checklist's unmet rows.
 *
 * Mirrors `useJumpToMessage` in messaging, with one addition the editor needs:
 * the field is usually on a DIFFERENT pane, which has to be switched first.
 * Panes stay mounted and are toggled with `hidden`, so the target element may
 * exist in the DOM while still being unrendered (zero-sized, `display: none`) —
 * scrolling to it in the same tick would land nowhere. Two `requestAnimationFrame`
 * hops put the work after React has committed the pane switch and the browser
 * has laid the pane out.
 *
 * Honours `prefers-reduced-motion`: an instant jump instead of a glide (the
 * flash keyframes are disabled in CSS under the same query, leaving a static
 * ring). Focus moves to the field's own control where there is one, so the
 * jump works for keyboard and screen-reader users too rather than being a
 * purely visual scroll.
 */
export function useEditorFieldJump(): (target: EditorFieldTarget) => void {
  const { goToPane } = useSubprofileEditorNav();
  // Every scheduled frame/timer, so a jump that is superseded (or a pane that
  // unmounts mid-flash) never fires into a stale DOM or leaves a ring stuck on.
  const framesRef = useRef<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const flashedRef = useRef<HTMLElement[]>([]);

  const clearPending = useCallback(() => {
    framesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    framesRef.current = [];
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    flashedRef.current.forEach((node) => node.classList.remove(FLASH_CLASS));
    flashedRef.current = [];
  }, []);

  useEffect(() => clearPending, [clearPending]);

  return useCallback(
    ({ pane, anchors }: EditorFieldTarget) => {
      clearPending();
      goToPane(pane);

      framesRef.current.push(
        window.requestAnimationFrame(() => {
          framesRef.current.push(
            window.requestAnimationFrame(() => {
              const nodes = anchors
                .map((anchor) => document.getElementById(anchor))
                .filter((node): node is HTMLElement => node !== null);
              const [first] = nodes;
              if (!first) return;

              first.scrollIntoView({
                behavior: prefersReducedMotionNow() ? "auto" : "smooth",
                block: "center",
              });

              nodes.forEach((node) => {
                node.classList.add(FLASH_CLASS);
                flashedRef.current.push(node);
                timersRef.current.push(
                  window.setTimeout(
                    () => node.classList.remove(FLASH_CLASS),
                    FLASH_MS,
                  ),
                );
              });

              // The field's own control, if it has a focusable one — the
              // `FormField` wrapper itself is a plain div.
              first
                .querySelector<HTMLElement>(
                  "input, textarea, select, button, [contenteditable='true'], [tabindex]:not([tabindex='-1'])",
                )
                ?.focus({ preventScroll: true });
            }),
          );
        }),
      );
    },
    [clearPending, goToPane],
  );
}
