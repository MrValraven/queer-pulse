/** Mirrors `--ease` in tokens/effects.css. */
const EASE_CSS = "cubic-bezier(0.22, 0.68, 0.16, 1)";
const MOVE_MS = 340;
const REDUCED_FADE_MS = 120;

export interface FocusLayerParts {
  /** The cream sheet that hides the page chrome. */
  backdrop: HTMLElement;
  /** The panel inside the layer. */
  panel: HTMLElement;
  /** The inline slot the panel leaves and comes back to. */
  slot: HTMLElement;
}

export type FocusLayerMove = "enterFromSlot" | "enter" | "exit";

/** The panel's current painted state, mid-animation included. */
function readPanelState(panel: HTMLElement): Keyframe {
  const computed = getComputedStyle(panel);
  return { transform: computed.transform, width: computed.width };
}

/**
 * The translate and width that lay the panel exactly over the inline slot.
 * The panel is centred by its auto margins, so its left edge moves by half of
 * any width change; the translate accounts for that, and both interpolate
 * linearly, so the left edge travels in a straight line.
 */
function slotKeyframe(panel: HTMLElement, slot: HTMLElement): Keyframe {
  const panelRect = panel.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();
  const panelCentre = panelRect.left + panelRect.width / 2;
  const offsetX = slotRect.left - (panelCentre - slotRect.width / 2);
  const offsetY = slotRect.top - panelRect.top;
  return {
    transform: `translate(${offsetX}px, ${offsetY}px)`,
    width: `${slotRect.width}px`,
  };
}

/**
 * Moves the focus layer between the inline slot and full screen. On the way
 * in the panel starts over the slot it just left, so the page never shows the
 * empty slot, and glides to its place while the backdrop fades in over the
 * page chrome. On the way out it glides back over the slot while the backdrop
 * fades, so the swap back inline lands on an identical frame. A reversal
 * mid-move starts from the panel's painted state. Under reduced motion the
 * panel jumps and only the backdrop fades.
 *
 * Resolves `true` when the move has finished and `false` when a later move
 * replaced it. Resolves `true` at once where the browser cannot animate
 * (jsdom).
 */
export function playFocusLayerMove(
  { backdrop, panel, slot }: FocusLayerParts,
  move: FocusLayerMove,
  isReducedMotion: boolean,
): Promise<boolean> {
  if (typeof panel.animate !== "function") return Promise.resolve(true);

  const isEntering = move !== "exit";
  const panelFrom = move === "enterFromSlot" ? null : readPanelState(panel);
  const backdropFrom = getComputedStyle(backdrop).opacity;
  panel.getAnimations().forEach((animation) => animation.cancel());
  backdrop.getAnimations().forEach((animation) => animation.cancel());

  // Measured with the previous move cancelled, so this is the static layout.
  const atSlot = slotKeyframe(panel, slot);
  const atRest: Keyframe = {
    transform: "translate(0px, 0px)",
    width: `${panel.getBoundingClientRect().width}px`,
  };
  const panelKeyframes = isEntering
    ? [panelFrom ?? atSlot, atRest]
    : [panelFrom ?? atRest, atSlot];
  const backdropKeyframes = [
    { opacity: move === "enterFromSlot" ? "0" : backdropFrom },
    { opacity: isEntering ? "1" : "0" },
  ];

  const duration = isReducedMotion ? REDUCED_FADE_MS : MOVE_MS;
  // Entering ends on the static layout, so the fill lets go at the end; the
  // exit holds its last frame until the panel is back inline.
  const fill: FillMode = isEntering ? "backwards" : "both";
  const panelAnimation = panel.animate(panelKeyframes, {
    duration,
    easing: isReducedMotion ? "step-start" : EASE_CSS,
    fill,
  });
  const backdropAnimation = backdrop.animate(backdropKeyframes, {
    duration,
    easing: isReducedMotion ? "linear" : EASE_CSS,
    fill,
  });

  return Promise.all([panelAnimation.finished, backdropAnimation.finished])
    .then(() => true)
    .catch(() => false);
}
