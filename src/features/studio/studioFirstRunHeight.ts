import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/**
 * The live height of an element, read before paint and on every resize, so
 * a wrapper can spring to it as the welcome's steps change. A zero reading
 * (the frame between one step leaving and the next arriving) is skipped, so
 * the wrapper never collapses in between. Null until the first reading,
 * when the wrapper keeps its natural height.
 */
export function useStudioMeasuredHeight<Element extends HTMLElement>(): {
  ref: RefObject<Element | null>;
  height: number | null;
} {
  const ref = useRef<Element>(null);
  const [height, setHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const read = (next: number) => {
      if (next > 0) setHeight(next);
    };
    read(element.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => read(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, height };
}
