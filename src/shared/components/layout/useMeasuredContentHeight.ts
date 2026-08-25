import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Measures an element's natural height and hands it back so an ancestor can
 * carry that height explicitly and transition between values.
 *
 * `height: auto` has nothing to interpolate, so a box whose content swaps
 * (the mega panel changing active section, say) resizes in one layout pass and
 * snaps. Putting the measured pixel height on the box makes the change
 * animatable.
 *
 * `isTransitionEnabled` turns true one frame after the first measurement lands,
 * so the initial `auto` to pixels handover (visually identical) never animates
 * and the box still opens at its natural size.
 */
export function useMeasuredContentHeight<ElementType extends HTMLElement>() {
  const contentRef = useRef<ElementType>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(false);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const measure = () => setContentHeight(node.getBoundingClientRect().height);
    measure();
    // The observed node's own height is never the one we write back, so this
    // can't feed itself.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (contentHeight === null || isTransitionEnabled) return;
    const frame = requestAnimationFrame(() => setIsTransitionEnabled(true));
    return () => cancelAnimationFrame(frame);
  }, [contentHeight, isTransitionEnabled]);

  return { contentRef, contentHeight, isTransitionEnabled };
}
