import { useState } from "react";
import type { ImageSlotTint } from "../../shared/components/ui";
import { ImageSlot } from "../../shared/components/ui";
import { StudioCoverFallback } from "./kit/StudioCoverFallback";
import css from "./StudioPlaylist.module.css";

const CELLS = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

/** A full mosaic needs four distinct covers; fewer show the first alone. */
const MOSAIC_COVER_COUNT = CELLS.length;

/** A mosaic cover that fades in once loaded; one already loaded on mount
 *  (from the cache) shows at once. `onLoadError` hears a cover that fails. */
function StudioMosaicImage({
  src,
  onLoadError,
}: {
  src: string;
  onLoadError?: (failedUrl: string) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <img
      ref={(image) => {
        if (image?.complete && image.naturalWidth > 0) setIsLoaded(true);
      }}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      data-loaded={isLoaded}
      onLoad={() => setIsLoaded(true)}
      onError={onLoadError && (() => onLoadError(src))}
    />
  );
}

/** A playlist's cover: with fewer than four distinct covers the first one
 *  full-bleed, and with four or more a 2x2 mosaic of the first four in
 *  playlist order. With none, the wordless kit fallback in the playlist's
 *  hue with a note. Fills a positioned parent, like ImageSlot does.
 *  Decorative: the name sits beside. `onLoadError` is optional and hears
 *  each cover URL that fails to load, so a caller can drop it. */
export function StudioPlaylistCover({
  coverUrls,
  tint,
  label,
  radius = 10,
  onLoadError,
}: {
  coverUrls: string[];
  tint: ImageSlotTint;
  label: string;
  radius?: number;
  onLoadError?: (failedUrl: string) => void;
}) {
  if (coverUrls.length === 0) {
    return (
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: radius,
        }}
      >
        <StudioCoverFallback title={label} kind="music" tint={tint} />
      </span>
    );
  }
  const [firstUrl = ""] = coverUrls;
  if (coverUrls.length < MOSAIC_COVER_COUNT) {
    return (
      <ImageSlot
        src={firstUrl}
        tint={tint}
        width="100%"
        height="100%"
        radius={radius}
        placeholder={label}
        style={{ position: "absolute", inset: 0 }}
        onLoadError={onLoadError && (() => onLoadError(firstUrl))}
      />
    );
  }
  return (
    <div className={css.mosaic} data-tint={tint} aria-hidden>
      {coverUrls.slice(0, MOSAIC_COVER_COUNT).map((url, index) => (
        <span key={CELLS[index]} className={css.mosaicCell}>
          <StudioMosaicImage key={url} src={url} onLoadError={onLoadError} />
        </span>
      ))}
    </div>
  );
}
