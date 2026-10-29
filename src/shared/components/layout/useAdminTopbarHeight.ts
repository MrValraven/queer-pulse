import { useLayoutEffect, useRef } from "react";

/** The custom property the shell carries the top bar's height on. */
export const ADMIN_TOPBAR_HEIGHT_PROPERTY = "--admin-topbar-h";

/**
 * Publishes the admin top bar's rendered height as `--admin-topbar-h` on the
 * shell, so sticky page chrome inside it (the listing editor's jump nav, its
 * live preview and its section scroll margins) stops right under the bar.
 *
 * Measured, because no one number in a stylesheet holds on every admin page:
 * on a phone the bar wraps its icons onto a second row whenever the
 * breadcrumb runs long, and how long it runs depends on the page, the locale
 * and the reader's text size. Holding the bar to one row would cost every
 * long breadcrumb its ending. The notch inset is part of the bar's padding,
 * so the border-box height carries it too.
 *
 * A layout effect, so the first paint already has the value.
 */
export function useAdminTopbarHeight() {
  const shellRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const topbar = topbarRef.current;
    if (!shell || !topbar) return;
    const publish = () =>
      shell.style.setProperty(
        ADMIN_TOPBAR_HEIGHT_PROPERTY,
        `${topbar.getBoundingClientRect().height}px`,
      );
    publish();
    // jsdom has no observer: the first measurement stands.
    if (typeof ResizeObserver === "undefined") return;
    // The bar's own box is observed and the shell's property is what gets
    // written, so a measurement can never feed itself.
    const observer = new ResizeObserver(publish);
    observer.observe(topbar, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  return { shellRef, topbarRef };
}
