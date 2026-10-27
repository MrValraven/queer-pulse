import { useLayoutEffect, type RefObject } from "react";

/**
 * Parks a sticky bar under the AdminShell top bar (the sibling before its
 * `main`), which grows when its breadcrumb wraps on a phone. Writes the top
 * bar's height to `--pdf-bar-top` on the bar.
 */
export function useTopBarOffset(barRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const bar = barRef.current;
    const topBar = bar?.closest(
      "main[data-shell='rail']",
    )?.previousElementSibling;
    if (!bar || !(topBar instanceof HTMLElement)) return;
    const observer = new ResizeObserver(() => {
      bar.style.setProperty("--pdf-bar-top", `${topBar.offsetHeight}px`);
    });
    observer.observe(topBar);
    return () => observer.disconnect();
  }, [barRef]);
}
