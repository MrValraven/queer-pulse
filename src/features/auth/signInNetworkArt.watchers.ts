/** Everything the network art listens to outside its own frame loop: the
 *  host's size, whether the canvas is on screen, the theme on <html>, and
 *  whether the tab is visible. Returns one function that stops them all. */

export interface ArtHostHandlers {
  /** The host's padding box, which the canvas fills, and its top and
   *  bottom padding: on a phone, the safe-area inset the art reaches under
   *  and the text zone at its foot. */
  onResize: (
    width: number,
    height: number,
    insetTop: number,
    insetBottom: number,
  ) => void;
  onScreenChange: (isOnScreen: boolean) => void;
  onThemeChange: () => void;
  onPageVisibilityChange: (isPageVisible: boolean) => void;
}

export function watchArtHost(
  canvas: HTMLCanvasElement,
  host: Element,
  handlers: ArtHostHandlers,
): () => void {
  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver((entries) => {
          // contentRect's left and top are the host's padding; the bottom
          // padding is read from its computed style.
          const box = entries[entries.length - 1]?.contentRect;
          if (!box) return;
          const insetBottom = Math.round(
            parseFloat(getComputedStyle(host).paddingBottom) || 0,
          );
          handlers.onResize(
            Math.round(box.width + box.left),
            Math.round(box.height + box.top) + insetBottom,
            Math.round(box.top),
            insetBottom,
          );
        });
  resizeObserver?.observe(host);

  const intersectionObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          const entry = entries[entries.length - 1];
          if (entry) handlers.onScreenChange(entry.isIntersecting);
        });
  intersectionObserver?.observe(canvas);

  const themeObserver = new MutationObserver(handlers.onThemeChange);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  const handleVisibilityChange = () =>
    handlers.onPageVisibilityChange(!document.hidden);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    themeObserver.disconnect();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
