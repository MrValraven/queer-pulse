import { useLayoutEffect, useRef, useState } from "react";

/** The scale that fits the viewport-tall canvas into the frame, kept current as either resizes. */
export function useCanvasScale() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (frame === null || canvas === null) return undefined;
    const measure = () => {
      const canvasHeight = canvas.offsetHeight;
      if (canvasHeight > 0) setScale(frame.clientHeight / canvasHeight);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  return { frameRef, canvasRef, scale };
}
