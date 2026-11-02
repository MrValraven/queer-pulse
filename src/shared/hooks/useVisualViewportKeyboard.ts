import { useEffect } from "react";

/** Below this the shrink is a toolbar or an accessory bar, too short to be
 *  a soft keyboard, so `data-keyboard-open` stays off. */
const KEYBOARD_OPEN_MIN_OVERLAP_PX = 100;

/** `<input type>` values that open the soft text keyboard. A checkbox, a
 *  radio, a range or a file input takes focus without raising one. */
const KEYBOARD_INPUT_TYPES = new Set([
  "text",
  "search",
  "email",
  "url",
  "tel",
  "password",
  "number",
]);

/** True while `element` is something a soft keyboard opens for: a textarea, a
 *  contenteditable host, or an editable input whose type takes text. An input
 *  with no `type` attribute reads back as "text". */
function isKeyboardRaisingElement(element: Element | null): boolean {
  if (element instanceof HTMLTextAreaElement) return !element.readOnly;
  if (element instanceof HTMLInputElement) {
    return !element.readOnly && KEYBOARD_INPUT_TYPES.has(element.type);
  }
  return element instanceof HTMLElement && element.isContentEditable;
}

/**
 * Keeps a bottom-anchored composer above the on-screen keyboard on engines
 * where the keyboard overlays the layout viewport and leaves its size alone,
 * principally iOS Safari, which ignores the `interactive-widget` viewport meta.
 *
 * It publishes the keyboard's visible overlap as the `--keyboard-inset` CSS
 * variable on `<html>` for layouts that subtract it from their height (a
 * `Modal`'s sheet, a bottom bar). On engines that already shrink the layout
 * viewport for the keyboard (Chromium with `interactive-widget=resizes-content`),
 * the overlap resolves to ~0px. It also no-ops where `visualViewport` is
 * unavailable.
 *
 * The keyboard only counts while a keyboard-raising element has focus (a
 * textarea, a contenteditable host, an editable text-like input). Everything
 * else publishes `--keyboard-inset: 0px` and no `data-keyboard-open`. Reported
 * on an installed iPhone 14 on iOS 26 (2026-11-02): after the keyboard closed,
 * `visualViewport.offsetTop` stayed non-zero (Apple FB20249802), so the overlap
 * read as a keyboard that was not there, lifted the messages `.app` and left an
 * unpainted strip under the composer. Focus is the one signal that stale value
 * cannot fake. `focusin` and `focusout` on the document schedule the recompute;
 * the recompute runs in the animation frame because `focusout` fires before the
 * next element has taken focus, so `document.activeElement` is still `body`
 * when it fires.
 *
 * "Keyboard open" is decided without `window.innerHeight`, which iOS 26
 * standalone reports about 47px short of the real screen (WebKit bugs 292603
 * and 301994). The hook remembers the largest `visualViewport.height` seen
 * while nothing keyboard-raising has focus (the resting visual height) and
 * calls the keyboard open when a keyboard-raising element has focus AND
 * `restingVisualHeight - visualViewport.height` reaches
 * `KEYBOARD_OPEN_MIN_OVERLAP_PX`. `data-keyboard-open` follows that decision.
 * The resting height is cleared on window `resize` and `orientationchange`
 * (right away when nothing has focus, at the next unfocused recompute when a
 * field has focus), so a rotation never leaves the old orientation's height
 * behind.
 *
 * While a keyboard-raising element has focus the pass also publishes
 * `--visual-viewport-top` (`offsetTop`) and `--visual-viewport-height`
 * (`height`) in px, and removes them otherwise. The messages `.app` sizes
 * itself from these two alone while the keyboard is open: a fixed box's
 * `top` and `height` are in layout-viewport coordinates, the frame the visual
 * viewport reports in, so the box lands on the visible region whatever
 * `innerHeight` says. They stay unpublished at rest on purpose: a browser tab's
 * collapsing toolbar moves `height` on every scroll tick, and each write
 * restyles the document.
 *
 * BOTH `visualViewport` events have to schedule a recompute, `resize` AND
 * `scroll`. `resize` alone is the obvious reading, since that is what fires on
 * keyboard open and close, and it is wrong, because iOS moves `offsetTop` with
 * a `scroll` event and no `resize`. What that costs on iOS with a
 * bottom-anchored composer: focusing the field fires `resize` while the visual
 * viewport is still flush with the layout viewport (`offsetTop` 0), so the
 * overlap reads as the FULL keyboard height and the layout shrinks by it,
 * lifting the composer clear. iOS then does its own "scroll the focused field
 * into view" pass, decided from where the field was BEFORE that shrink (under
 * the keyboard), and shifts the visual viewport down by roughly the keyboard's
 * height. That arrives as a `scroll` event and no `resize`. With no `scroll` listener the
 * published values stay at the stale full-keyboard numbers, the keyboard is
 * subtracted twice, and the composer ends up a whole keyboard-height ABOVE the
 * keyboard with a dead band between them (reported on an installed iPhone PWA,
 * in a chat thread, on the first tap into the composer).
 *
 * The cost of listening to `scroll` is close to nothing, despite it firing on
 * every momentum tick: with nothing focused every published value is constant
 * (`--keyboard-inset` is 0px, the two visual viewport variables are removed),
 * and the unchanged-value check returns before touching a style. Writes only
 * happen when a value really moves. Every recompute is also coalesced through
 * `requestAnimationFrame`, so at most one write lands per frame either way.
 *
 * The same pass publishes `--layout-viewport-height` (`window.innerHeight`) for
 * the layouts that still compute a height from it. The messages `.app` no longer
 * does on a phone (a fixed box pinned with `top`/`bottom`, or sized from the
 * visual viewport while the keyboard is up). A `window` `resize` listener covers
 * engines that change `innerHeight` with no visualViewport event.
 *
 * `<html>` carries `data-keyboard-open` while the keyboard is open by the rule
 * above. CSS cannot branch on a custom property's value, and a few layouts
 * differ with the keyboard up (a `Modal` with `shouldCollapseSubWithKeyboard`
 * drops its sub line, the messages `.app` sizes from the visual viewport and the
 * composer drops its home-indicator padding), so they key on the attribute.
 */
export function useVisualViewportKeyboard(): void {
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const documentElement = document.documentElement;
    let pendingAnimationFrameId: number | null = null;
    let restingVisualHeightPx = 0;
    let isRestingVisualHeightResetPending = false;
    const lastWrittenValueByProperty = new Map<string, string>();

    const publishProperty = (propertyName: string, value: string) => {
      if (lastWrittenValueByProperty.get(propertyName) === value) return;
      lastWrittenValueByProperty.set(propertyName, value);
      documentElement.style.setProperty(propertyName, value);
    };

    const unpublishProperty = (propertyName: string) => {
      if (!lastWrittenValueByProperty.delete(propertyName)) return;
      documentElement.style.removeProperty(propertyName);
    };

    const applyViewportVariables = () => {
      pendingAnimationFrameId = null;
      publishProperty("--layout-viewport-height", `${window.innerHeight}px`);

      const isKeyboardRaiserFocused = isKeyboardRaisingElement(
        document.activeElement,
      );
      if (!isKeyboardRaiserFocused) {
        if (isRestingVisualHeightResetPending) {
          isRestingVisualHeightResetPending = false;
          restingVisualHeightPx = 0;
        }
        restingVisualHeightPx = Math.max(
          restingVisualHeightPx,
          visualViewport.height,
        );
      }

      const keyboardOverlapPx = isKeyboardRaiserFocused
        ? Math.max(
            0,
            window.innerHeight -
              visualViewport.height -
              visualViewport.offsetTop,
          )
        : 0;
      publishProperty("--keyboard-inset", `${keyboardOverlapPx}px`);

      // Mounted with a field already focused, so no resting height was seen:
      // `innerHeight` is the best remaining reference.
      const referenceHeightPx = restingVisualHeightPx || window.innerHeight;
      const isKeyboardOpen =
        isKeyboardRaiserFocused &&
        referenceHeightPx - visualViewport.height >=
          KEYBOARD_OPEN_MIN_OVERLAP_PX;
      documentElement.toggleAttribute("data-keyboard-open", isKeyboardOpen);

      if (isKeyboardRaiserFocused) {
        publishProperty(
          "--visual-viewport-top",
          `${visualViewport.offsetTop}px`,
        );
        publishProperty(
          "--visual-viewport-height",
          `${visualViewport.height}px`,
        );
      } else {
        unpublishProperty("--visual-viewport-top");
        unpublishProperty("--visual-viewport-height");
      }
    };

    const scheduleViewportVariablesUpdate = () => {
      if (pendingAnimationFrameId !== null) return;
      pendingAnimationFrameId = window.requestAnimationFrame(
        applyViewportVariables,
      );
    };

    const handleWindowGeometryChange = () => {
      if (isKeyboardRaisingElement(document.activeElement)) {
        isRestingVisualHeightResetPending = true;
      } else {
        restingVisualHeightPx = 0;
      }
      scheduleViewportVariablesUpdate();
    };

    applyViewportVariables();
    visualViewport.addEventListener("resize", scheduleViewportVariablesUpdate);
    visualViewport.addEventListener("scroll", scheduleViewportVariablesUpdate);
    window.addEventListener("resize", handleWindowGeometryChange);
    window.addEventListener("orientationchange", handleWindowGeometryChange);
    document.addEventListener("focusin", scheduleViewportVariablesUpdate);
    document.addEventListener("focusout", scheduleViewportVariablesUpdate);
    return () => {
      visualViewport.removeEventListener(
        "resize",
        scheduleViewportVariablesUpdate,
      );
      visualViewport.removeEventListener(
        "scroll",
        scheduleViewportVariablesUpdate,
      );
      window.removeEventListener("resize", handleWindowGeometryChange);
      window.removeEventListener(
        "orientationchange",
        handleWindowGeometryChange,
      );
      document.removeEventListener("focusin", scheduleViewportVariablesUpdate);
      document.removeEventListener("focusout", scheduleViewportVariablesUpdate);
      if (pendingAnimationFrameId !== null) {
        window.cancelAnimationFrame(pendingAnimationFrameId);
      }
      documentElement.style.removeProperty("--keyboard-inset");
      documentElement.style.removeProperty("--layout-viewport-height");
      documentElement.style.removeProperty("--visual-viewport-top");
      documentElement.style.removeProperty("--visual-viewport-height");
      documentElement.removeAttribute("data-keyboard-open");
    };
  }, []);
}
