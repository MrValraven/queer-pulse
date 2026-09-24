import { useEffect, useLayoutEffect, useRef } from "react";

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

/** The phone frame stops growing here so a wide dock keeps some margin around
 *  it; the laptop frame may reach its true size. */
const MAX_ZOOM: Record<PreviewDevice, number> = {
  mobile: 0.85,
  desktop: 1,
};

/** The frame's 1px border on each side. The frame is `content-box`, so the page
 *  inside keeps the full layout width and the border adds to its outer width.
 *  Chrome keeps a zoomed border at 1px or more, so the border is taken off the
 *  available width before the fit instead of being scaled with the page. */
const FRAME_BORDER_TOTAL = 2;

function fitZoom(device: PreviewDevice, availableWidth: number): number {
  const zoom = Math.min(
    MAX_ZOOM[device],
    (availableWidth - FRAME_BORDER_TOTAL) / PREVIEW_LAYOUT_WIDTH[device],
  );
  // Rounded down, so the zoomed frame can only come out narrower than the
  // dock and a sub-pixel overflow never adds a horizontal scrollbar.
  return Math.floor(zoom * 1000) / 1000;
}

function applyZoom(
  frameElement: HTMLDivElement | null,
  device: PreviewDevice,
  availableWidth: number,
) {
  if (!frameElement || availableWidth <= 0) return;
  frameElement.style.zoom = String(fitZoom(device, availableWidth));
}

/**
 * Scales the docked preview's page frame to fit the dock. The persona page
 * lays itself out at the device's real width (its `@container` queries read
 * the unzoomed box), and CSS `zoom` shrinks the result to the dock's content
 * width.
 *
 * The zoom is written straight onto the frame element, so a resize (the grid
 * animates the dock through several widths on every device switch) never
 * re-renders the heavy page tree. The last measured width is kept, and a
 * device switch re-applies from it before paint, so the new layout width
 * shows at the right scale on its first frame.
 *
 * A width of 0 is skipped: the dock collapses to nothing while the preview is
 * hidden, and the last real zoom is what it should reopen at.
 */
export function usePreviewFit(device: PreviewDevice) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(0);
  const deviceRef = useRef(device);

  // Before the first measurement no width is known, so the zoom stays unset
  // until the observer's initial callback, which fires as soon as it observes.
  useLayoutEffect(() => {
    deviceRef.current = device;
    applyZoom(frameRef.current, device, lastWidthRef.current);
  }, [device]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      // `contentRect` is the content box, so the scroller's padding is
      // already left out of the width the frame has to fit in.
      const availableWidth = entries[0]?.contentRect.width ?? 0;
      if (availableWidth <= 0) return;
      lastWidthRef.current = availableWidth;
      applyZoom(frameRef.current, deviceRef.current, availableWidth);
    });
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, []);

  return { scrollRef, frameRef };
}
