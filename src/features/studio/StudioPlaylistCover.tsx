import { useState } from "react";
import type { ImageSlotTint } from "../../shared/components/ui";
import { ImageSlot } from "../../shared/components/ui";
import css from "./StudioPlaylist.module.css";

const CELLS = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

/** The cover shown in each of the four cells. Two covers sit on the
 *  diagonals; three repeat the first in the last cell; four fill in order. */
function cellCoverUrls(coverUrls: string[]): string[] {
  const coverOrder = coverUrls.length === 2 ? [0, 1, 1, 0] : [0, 1, 2, 3];
  return coverOrder
    .map((coverIndex) => coverUrls[coverIndex % coverUrls.length])
    .filter((url): url is string => Boolean(url));
}

/** A mosaic cover that fades in once loaded; one already loaded on mount
 *  (from the cache) shows at once. */
function StudioMosaicImage({ src }: { src: string }) {
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
    />
  );
}

/** A playlist's cover: its one release cover, or a 2x2 mosaic of up to four
 *  distinct covers in playlist order, repeated to fill every cell. Fills a
 *  positioned parent, like ImageSlot does. Decorative: the name sits beside. */
export function StudioPlaylistCover({
  coverUrls,
  tint,
  label,
  radius = 10,
}: {
  coverUrls: string[];
  tint: ImageSlotTint;
  label: string;
  radius?: number;
}) {
  if (coverUrls.length <= 1) {
    return (
      <ImageSlot
        src={coverUrls[0]}
        tint={tint}
        width="100%"
        height="100%"
        radius={radius}
        placeholder={label}
        style={{ position: "absolute", inset: 0 }}
      />
    );
  }
  return (
    <div className={css.mosaic} data-tint={tint} aria-hidden>
      {cellCoverUrls(coverUrls).map((url, index) => (
        <span key={CELLS[index]} className={css.mosaicCell}>
          <StudioMosaicImage key={url} src={url} />
        </span>
      ))}
    </div>
  );
}
