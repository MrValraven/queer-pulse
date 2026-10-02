import { useEffect, useState } from "react";
import { MARKER_HEIGHT } from "./render/frameMarker";

/** Room kept below the film for the status bar, and around it. */
const BAR_SPACE = 210;
const PADDING = 24;

function studioScale() {
  const pixelRatio = window.devicePixelRatio || 1;
  // 1/pixelRatio puts one film pixel on one device pixel: the capture is then
  // exactly 1920x1080. Smaller windows scale further down and the file is
  // upscaled from what was captured.
  return Math.min(
    1 / pixelRatio,
    (window.innerWidth - PADDING * 2) / 1920,
    (window.innerHeight - BAR_SPACE - PADDING * 2) / (1080 + MARKER_HEIGHT),
  );
}

/**
 * The scale the render studio shows the film at, and whether that is below
 * one film pixel per device pixel (the file would come out soft).
 */
export function useStudioScale() {
  const [scale, setScale] = useState(studioScale);

  useEffect(() => {
    const update = () => setScale(studioScale());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pixelRatio = window.devicePixelRatio || 1;
  return { scale, isSoft: scale * pixelRatio < 0.98 };
}
