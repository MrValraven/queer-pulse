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

/** Breathing room between the sticky chrome and a jumped-to field's edge. */
export const CHROME_GAP_PX = 12;

/** Frames to wait for the target pane to be laid out after a pane switch
 *  (about half a second at 60Hz) before landing anyway. */
const LAYOUT_WAIT_FRAMES = 30;

/** A card title at most this far above a field counts as the field's label. */
const HEADING_LABEL_MAX_GAP_PX = 48;

/** Controls a person types into. A jump prefers these, so focus lands where a
 *  keypress adds text: in a chip field the first focusable control is an
 *  existing chip, where Backspace would remove it. */
const TEXT_ENTRY_SELECTOR = [
  "textarea",
  "input:not([type])",
  "input[type='text']",
  "input[type='search']",
  "input[type='email']",
  "input[type='url']",
  "input[type='tel']",
  "input[type='number']",
]
  .map((selector) => `${selector}:not(:disabled):not([readonly])`)
  .join(", ");

/** Anything else that takes focus, for fields with nothing to type into. */
const FOCUSABLE_SELECTOR =
  "input, textarea, select, button, [contenteditable='true'], [tabindex]:not([tabindex='-1'])";

function isRendered(element: Element): boolean {
  return element.getClientRects().length > 0;
}

/** A control that names itself the jump's landing spot, for a field whose
 *  first button would change the value (a toggle chip). */
const EXPLICIT_TARGET_SELECTOR = "[data-jump-target]";

/** The control a jump focuses: a rendered `[data-jump-target]` when the field
 *  marks one, else the first empty text entry (a chip field's add box, a
 *  list's blank row), else the first text entry, else the first focusable
 *  control. */
function pickFocusTarget(anchor: HTMLElement): HTMLElement | null {
  const explicitTarget = [
    ...anchor.querySelectorAll<HTMLElement>(EXPLICIT_TARGET_SELECTOR),
  ].find(isRendered);
  if (explicitTarget) return explicitTarget;
  const textEntries = [
    ...anchor.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      TEXT_ENTRY_SELECTOR,
    ),
  ].filter(isRendered);
  return (
    textEntries.find((control) => control.value === "") ??
    textEntries[0] ??
    anchor.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
  );
}

/** Height of the sticky chrome at the top and bottom of the viewport, in px,
 *  measured at jump time: the app nav band (`--sticky-top`, which already
 *  follows the nav layout) plus the phone pane switcher `.ed-switch` stuck
 *  under it, and the editor savebar pinned to the bottom. */
export function measureStickyChrome(): { top: number; bottom: number } {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position: absolute; top: 0; visibility: hidden; height: var(--sticky-top)";
  document.body.append(probe);
  const navBand = probe.offsetHeight;
  probe.remove();

  const switchBar = document.querySelector<HTMLElement>(".ed-switch");
  const savebar = [...document.querySelectorAll<HTMLElement>(".savebar")].find(
    isRendered,
  );
  const savebarInset = savebar
    ? (Number.parseFloat(getComputedStyle(savebar).bottom) || 0) +
      savebar.offsetHeight
    : 0;
  return {
    top:
      navBand +
      (switchBar && isRendered(switchBar) ? switchBar.offsetHeight : 0),
    bottom: savebarInset,
  };
}

/**
 * How far above the anchor its visible label starts. A list field (FAQ,
 * referrals, first session steps) is labelled by the title of the card it
 * opens, which sits just outside its anchor; that title counts as part of the
 * field so the jump keeps it in sight. 0 when no heading sits right above.
 */
function labelLift(anchor: HTMLElement): number {
  const heading = anchor
    .closest("section, fieldset")
    ?.querySelector<HTMLElement>("h2, h3, h4, h5, h6, legend");
  if (!heading || anchor.contains(heading)) return 0;
  const anchorTop = anchor.getBoundingClientRect().top;
  const headingBox = heading.getBoundingClientRect();
  const gap = anchorTop - headingBox.bottom;
  return gap >= 0 && gap <= HEADING_LABEL_MAX_GAP_PX
    ? anchorTop - headingBox.top
    : 0;
}

/**
 * Scrolls a field into the band between the sticky chrome, returning how to
 * undo the temporary scroll margins. A field that fits is centred in the band;
 * a taller one (a list of FAQ entries) puts its TOP (or the card title
 * labelling it) just under the chrome, so its label and first control stay in
 * sight. When the focused control sits further down than one band from that
 * top, the control is the target instead, so focus never lands off screen.
 */
function scrollIntoBand(
  anchor: HTMLElement,
  control: HTMLElement | null,
): () => void {
  const chrome = measureStickyChrome();
  const band =
    window.innerHeight - chrome.top - chrome.bottom - 2 * CHROME_GAP_PX;
  const anchorBox = anchor.getBoundingClientRect();
  const controlReach = control
    ? control.getBoundingClientRect().bottom - anchorBox.top
    : 0;
  const isControlBeyondBand = controlReach > band;
  const target = control && isControlBeyondBand ? control : anchor;
  const lift = labelLift(anchor);
  const extraTop = target === anchor && controlReach + lift <= band ? lift : 0;
  const isTallerThanBand =
    target.getBoundingClientRect().height + extraTop > band;

  // scroll-margin is how `scrollIntoView` learns about the chrome (and the
  // label above the field), so it works for whichever element scrolls. Set
  // inline for this jump only.
  const { scrollMarginTop, scrollMarginBottom } = target.style;
  target.style.scrollMarginTop = `${chrome.top + CHROME_GAP_PX + extraTop}px`;
  target.style.scrollMarginBottom = `${chrome.bottom + CHROME_GAP_PX}px`;
  target.scrollIntoView({
    behavior: prefersReducedMotionNow() ? "instant" : "smooth",
    block: isTallerThanBand ? "start" : "center",
  });
  return () => {
    target.style.scrollMarginTop = scrollMarginTop;
    target.style.scrollMarginBottom = scrollMarginBottom;
  };
}

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
 * lands in the right place. Used by the publish checklist's unmet rows and
 * by `EditorFieldDeepLink` (`?field=` links from the public page).
 *
 * Mirrors `useJumpToMessage` in messaging, with one addition the editor needs:
 * the field is usually on a DIFFERENT pane, which has to be switched first.
 * Panes stay mounted and are toggled with `hidden`, so the target element may
 * exist in the DOM while still being unrendered (zero-sized, `display: none`),
 * and scrolling to it in the same tick would land nowhere. The work waits in
 * `requestAnimationFrame` hops until the field is laid out, plus one more, so
 * React has committed the pane switch and the browser has laid the pane out.
 *
 * Honours `prefers-reduced-motion`: an instant jump instead of a glide (the
 * flash keyframes are disabled in CSS under the same query, leaving a static
 * ring). Focus moves to the field's own control where there is one (a marked
 * `[data-jump-target]`, else its text entry, see `pickFocusTarget`), so the
 * jump works for keyboard and screen-reader users too and is more than a
 * visual scroll. The scroll clears the sticky chrome (see `scrollIntoBand`),
 * so the focused control is visible.
 */
export function useEditorFieldJump(): (target: EditorFieldTarget) => void {
  const { activePane, goToPane } = useSubprofileEditorNav();
  // Every scheduled frame and every temporary DOM change, so a jump that is
  // superseded (or a pane that unmounts mid-flash) never fires into a stale
  // DOM or leaves a ring or scroll margin stuck on.
  const framesRef = useRef<number[]>([]);
  const timerRef = useRef<number | undefined>(undefined);
  const undoRef = useRef<Array<() => void>>([]);

  const settle = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
    undoRef.current.forEach((undo) => undo());
    undoRef.current = [];
  }, []);

  const clearPending = useCallback(() => {
    framesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    framesRef.current = [];
    settle();
  }, [settle]);

  useEffect(() => clearPending, [clearPending]);

  return useCallback(
    ({ pane, anchors }: EditorFieldTarget) => {
      clearPending();
      // A pane switch pushes history, so only switch when it is a real one:
      // a jump within the open pane (or from a `?field=` deep link that
      // already landed on it) must not leave a duplicate Back step.
      if (pane !== activePane) goToPane(pane);

      const findNodes = () =>
        anchors
          .map((anchor) => document.getElementById(anchor))
          .filter((node): node is HTMLElement => node !== null);

      const land = () => {
        const nodes = findNodes();
        const [first] = nodes;
        if (!first) return;

        // The field's own control, if it has a focusable one; the
        // `FormField` wrapper itself is a plain div.
        const control = pickFocusTarget(first);
        undoRef.current.push(scrollIntoBand(first, control));

        nodes.forEach((node) => {
          node.classList.add(FLASH_CLASS);
          undoRef.current.push(() => node.classList.remove(FLASH_CLASS));
        });
        timerRef.current = window.setTimeout(settle, FLASH_MS);

        control?.focus({ preventScroll: true });
      };

      // Wait for the pane to be laid out (a route change can commit a few
      // frames late), then one frame more so the pane router's own "focus
      // the new pane's heading" effect has run and the field keeps focus.
      const waitForLayout = (framesLeft: number) => {
        framesRef.current.push(
          window.requestAnimationFrame(() => {
            const [first] = findNodes();
            const isLaidOut = first !== undefined && isRendered(first);
            if (!isLaidOut && framesLeft > 0) {
              waitForLayout(framesLeft - 1);
              return;
            }
            framesRef.current.push(window.requestAnimationFrame(land));
          }),
        );
      };
      waitForLayout(LAYOUT_WAIT_FRAMES);
    },
    [activePane, clearPending, goToPane, settle],
  );
}
