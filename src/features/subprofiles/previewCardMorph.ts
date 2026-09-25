import { cubicBezier } from "motion/react";

/** The two widths the editor's docked preview can lay the persona page out at. */
export type PreviewDevice = "mobile" | "desktop";

/** A phone's layout width, in CSS pixels. */
export const MOBILE_LAYOUT_WIDTH = 390;
/** A laptop's layout width, in CSS pixels. Every persona container breakpoint
 *  sits at or below 1080px (the therapist layout's `@container (max-width:
 *  1080px)` is the widest), so 1100 still renders the full desktop tier while
 *  keeping the zoom as high as possible. */
export const DESKTOP_LAYOUT_WIDTH = 1100;

export const PREVIEW_LAYOUT_WIDTH: Record<PreviewDevice, number> = {
  mobile: MOBILE_LAYOUT_WIDTH,
  desktop: DESKTOP_LAYOUT_WIDTH,
};

/** The phone page stops growing here so a wide dock keeps some margin around
 *  its card; the laptop page may reach its true size. */
const MAX_ZOOM: Record<PreviewDevice, number> = {
  mobile: 0.85,
  desktop: 1,
};

/** The card's 1px border on each side. The card is `content-box` and carries
 *  no zoom of its own, so its content box is exactly the zoomed page's width
 *  and the border adds to its outer width. The border is taken off the
 *  available width before the fit, and every width this file writes onto the
 *  card is a content width. */
const FRAME_BORDER_TOTAL = 2;

/* The swap's timings mirror the motion tokens `persona-editor.css` animates
   with, so each phase of `usePreviewFit` hands over when the CSS it waits on
   has finished. */
/** The old page's fade out, `--dur-fast`. */
export const FADE_OUT_MS = 150;
/** The editor grid's `grid-template-columns` glide on `.ed`, `--dur-slow`. */
export const GRID_GLIDE_MS = 400;
/** The new page's fade and rise in, `--dur-base`. */
export const FADE_IN_MS = 250;
/** Added to every wait. A CSS transition starts on the style recalc after the
 *  attribute changes, a frame or two after its timer starts, and a phase that
 *  handed over early would cut the last frames of the one before it. */
export const TIMER_SLACK_MS = 50;
/** The card's height release on `entering`, `--dur-base`. */
const HEIGHT_RELEASE_MS = 250;
/** `--ease`, the curve the grid glides the dock with, so the card's outline
 *  keeps pace with the dock it sits in. */
const easeGlide = cubicBezier(0.22, 0.68, 0.16, 1);
/** `--ease-out`, for the height release. The Web Animations API reads a plain
 *  easing string and cannot resolve the token itself. */
const HEIGHT_RELEASE_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

function fitZoom(device: PreviewDevice, availableWidth: number): number {
  const zoom = Math.min(
    MAX_ZOOM[device],
    (availableWidth - FRAME_BORDER_TOTAL) / PREVIEW_LAYOUT_WIDTH[device],
  );
  // Rounded down, so the zoomed page can only come out narrower than the
  // dock and a sub-pixel overflow never adds a horizontal scrollbar.
  return Math.floor(zoom * 1000) / 1000;
}

export function applyZoom(
  pageElement: HTMLElement | null,
  device: PreviewDevice,
  availableWidth: number,
) {
  if (!pageElement || availableWidth <= 0) return;
  pageElement.style.zoom = String(fitZoom(device, availableWidth));
}

export function applyLayoutWidth(
  pageElement: HTMLElement,
  device: PreviewDevice,
) {
  pageElement.style.width = `${PREVIEW_LAYOUT_WIDTH[device]}px`;
}

/** The card's content width once `device` is showing at rest in a dock this
 *  wide: the page's layout width under the same floor-rounded zoom the hook
 *  applies, so a morph that ends here hands over to the card's natural width
 *  without a jump. */
function fittedCardWidth(device: PreviewDevice, availableWidth: number) {
  return fitZoom(device, availableWidth) * PREVIEW_LAYOUT_WIDTH[device];
}

/**
 * Freezes the card at its current size for the length of a swap and returns
 * that content box. Once the old page has faded out it skips layout and its
 * height collapses, and the new layout width it takes would resize a card
 * that hugs it, so the card carries both as inline pixels until
 * `releaseCardSize`. Measured before the running animations are cancelled,
 * so a swap that interrupts a height release starts from the height on
 * screen.
 */
function holdCardSize(cardElement: HTMLElement) {
  const rect = cardElement.getBoundingClientRect();
  const size = {
    width: rect.width - FRAME_BORDER_TOTAL,
    height: rect.height - FRAME_BORDER_TOTAL,
  };
  cardElement.getAnimations().forEach((animation) => animation.cancel());
  cardElement.style.width = `${size.width}px`;
  cardElement.style.height = `${size.height}px`;
  return size;
}

/**
 * Lets the card hug its page again. The inline width goes at once: the morph
 * ended on the page's fitted width, so the card keeps its size. The height
 * glides from the pinned pixels to the new page's natural height, measured
 * here in the frame the new page first lays out in. Without a `pinnedHeight`
 * (reduced motion) the card takes its natural size straight away.
 */
export function releaseCardSize(
  cardElement: HTMLElement,
  pinnedHeight?: number,
) {
  cardElement.getAnimations().forEach((animation) => animation.cancel());
  cardElement.style.width = "";
  cardElement.style.height = "";
  if (pinnedHeight === undefined) return;
  const naturalHeight =
    cardElement.getBoundingClientRect().height - FRAME_BORDER_TOTAL;
  if (Math.abs(naturalHeight - pinnedHeight) <= 1) return;
  cardElement.animate(
    [{ height: `${pinnedHeight}px` }, { height: `${naturalHeight}px` }],
    { duration: HEIGHT_RELEASE_MS, easing: HEIGHT_RELEASE_EASING },
  );
}

export interface CardMorph {
  /** The card's content height when the swap began, held inline until
   *  `releaseCardSize` lets it go. */
  pinnedHeight: number;
  /** The grid has settled: jump to the end width and stop. */
  settle: () => void;
  /** Stop where the card stands, for a newer swap to morph on from. */
  cancel: () => void;
}

/**
 * Holds the card at its current size (`holdCardSize`), then stretches or
 * shrinks its outline from that width to the new device's fitted width, one
 * inline `width` per animation frame, in step with the grid's glide of the
 * dock. Both ends follow the dock as it moves: the start width is held inside
 * the available width so a narrowing dock never clips the card's border, and
 * the end width is the fit against the dock as it stands. `availableWidthRef`
 * holds the last width the hook's ResizeObserver recorded, so the morph adds
 * no layout reads of its own. The card's page keeps a fixed width and zoom
 * meanwhile (and skips layout once faded out), so each width write relayouts
 * only the card itself.
 */
export function startCardMorph(
  cardElement: HTMLElement,
  device: PreviewDevice,
  availableWidthRef: { readonly current: number },
): CardMorph {
  const { width: startWidth, height: pinnedHeight } = holdCardSize(cardElement);
  const startTime = performance.now();
  let frameRequest = 0;

  const writeWidth = (progress: number) => {
    const availableWidth = availableWidthRef.current;
    if (availableWidth <= 0) return;
    const fromWidth = Math.min(startWidth, availableWidth - FRAME_BORDER_TOTAL);
    const toWidth = fittedCardWidth(device, availableWidth);
    const width = fromWidth + (toWidth - fromWidth) * easeGlide(progress);
    cardElement.style.width = `${width}px`;
  };
  // The loop runs past the glide's nominal length until the grid reports it
  // has settled: the CSS transition starts a frame or two after this does,
  // and at full progress the end width still tracks the dock's last steps. A
  // frame's timestamp is when that frame began, which can sit a little before
  // `startTime`, so progress is held at 0 or above.
  const step = (timestamp: number) => {
    const elapsed = Math.max(0, timestamp - startTime);
    writeWidth(Math.min(1, elapsed / GRID_GLIDE_MS));
    frameRequest = window.requestAnimationFrame(step);
  };
  frameRequest = window.requestAnimationFrame(step);

  const cancel = () => window.cancelAnimationFrame(frameRequest);
  return {
    pinnedHeight,
    settle: () => {
      cancel();
      writeWidth(1);
    },
    cancel,
  };
}
