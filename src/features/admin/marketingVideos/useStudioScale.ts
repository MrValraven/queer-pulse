import { useEffect, useState } from "react";
import type { FilmSize } from "./marketingVideos.data";
import { MARKER_HEIGHT } from "./render/frameMarker";

/** Room kept below the film for the status bar. */
const BAR_SPACE = 210;
/** The status bar's width beside a tall film (.studio[data-bar-beside] .bar). */
export const BAR_WIDTH = 400;
const PADDING = 24;

/**
 * A tall film (the 4:5 post) would leave most of the window's width empty
 * with the bar under it, so the bar moves beside it and the film gets the
 * full height. This is the default layout; studioLayout picks the final one.
 */
export const isBarBesideFilm = (size: FilmSize) => size.height > size.width;

function layoutScale(size: FilmSize, isBarBeside: boolean) {
  const pixelRatio = window.devicePixelRatio || 1;
  const widthRoom =
    window.innerWidth - (isBarBeside ? BAR_WIDTH : 0) - PADDING * 2;
  const heightRoom =
    window.innerHeight - (isBarBeside ? 0 : BAR_SPACE) - PADDING * 2;
  // 1/pixelRatio puts one film pixel on one device pixel: the capture is then
  // exactly the film's size. Smaller windows scale further down and the file
  // is upscaled from what was captured.
  return Math.min(
    1 / pixelRatio,
    widthRoom / size.width,
    heightRoom / (size.height + MARKER_HEIGHT),
  );
}

/**
 * Where the bar goes and the scale that leaves the film. A tall film weighs
 * both layouts and takes the one that shows it larger: beside on most
 * screens, below in a narrow, tall window. A wide film keeps the bar below
 * whatever the window. The beside layout often scores a little higher for it
 * (0.767 against 0.753 in a 1920x1080 window), and the bar below a 16:9 film
 * is the layout the studio was built around.
 */
function studioLayout(size: FilmSize) {
  const belowScale = layoutScale(size, false);
  if (!isBarBesideFilm(size)) return { scale: belowScale, isBarBeside: false };
  const besideScale = layoutScale(size, true);
  // A tie (both capped at one film pixel per device pixel) keeps the default.
  return besideScale >= belowScale
    ? { scale: besideScale, isBarBeside: true }
    : { scale: belowScale, isBarBeside: false };
}

/**
 * The scale the render studio shows the film at, whether that is below one
 * film pixel per device pixel (the file would come out soft), and whether
 * the status bar sits beside the film.
 */
export function useStudioScale(size: FilmSize) {
  const [layout, setLayout] = useState(() => studioLayout(size));

  useEffect(() => {
    const update = () => setLayout(studioLayout(size));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [size]);

  const pixelRatio = window.devicePixelRatio || 1;
  return {
    scale: layout.scale,
    isSoft: layout.scale * pixelRatio < 0.98,
    isBarBeside: layout.isBarBeside,
  };
}
