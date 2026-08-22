import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

/**
 * The laminate sheen that follows the pointer across a card.
 *
 * The highlight is written straight onto the node as custom properties inside
 * a single coalesced animation frame, never through state: a pointer emits
 * moves far faster than React can usefully re-render, and re-rendering a card
 * to move a highlight would re-run the whole QR module grid with it.
 *
 * Its own hook so `MembershipCardFace` stays under the repo's 200-line limit,
 * and because this is a self-contained piece of imperative DOM work with no
 * bearing on what the card says.
 *
 * Honours reduced motion by simply never tracking: a sheen chasing the cursor
 * is decoration, so the correct reduced-motion behaviour is absence.
 */
export function useCardGloss(reducedMotion: boolean): {
  shellRef: RefObject<HTMLDivElement | null>;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLDivElement>) => void;
} {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointRef = useRef<{ x: number; y: number } | null>(null);

  const paintGloss = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const node = shellRef.current;
      const point = pointRef.current;
      if (!node || !point) return;
      node.style.setProperty("--gloss-x", `${point.x}%`);
      node.style.setProperty("--gloss-y", `${point.y}%`);
    });
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
    event.currentTarget.style.setProperty("--gloss-lit", "1");
    paintGloss();
  };

  const onPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--gloss-lit", "0");
  };

  return { shellRef, onPointerMove, onPointerLeave };
}
