import type { CSSProperties } from "react";
import type { FilmSize } from "./marketingVideos.data";

/**
 * A film's size as CSS custom properties, for the rules in
 * MarketingVideos.module.css that size boxes to the film:
 * --film-width and --film-height in pixels, --film-aspect as a ratio.
 */
export function filmSizeStyle({ width, height }: FilmSize): CSSProperties {
  return {
    "--film-width": `${width}px`,
    "--film-height": `${height}px`,
    "--film-aspect": `${width} / ${height}`,
  } as CSSProperties;
}
