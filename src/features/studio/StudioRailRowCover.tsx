import { useState, type ReactNode } from "react";
import type { ImageSlotTint } from "../../shared/components/ui";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import css from "./StudioRailPlaylists.module.css";

/** A rail row's art: its covers (one full-bleed, four or more as a
 *  mosaic), or a quiet tile with `fallbackIcon` while it has none, so the
 *  rail never shows a blank square. A cover that fails to load drops out
 *  (a mosaic falls back to the covers that loaded), and once every cover
 *  has failed the row shows the tile too. The failed list is keyed by the
 *  row's covers, so new covers start clean. */
export function StudioRailCoverArt({
  coverUrls,
  tint,
  fallbackIcon,
}: {
  coverUrls: string[];
  tint: ImageSlotTint;
  fallbackIcon: ReactNode;
}) {
  const coverKey = coverUrls.join("\n");
  const [failedCovers, setFailedCovers] = useState({
    coverKey,
    failedUrls: [] as string[],
  });
  const failedUrls =
    failedCovers.coverKey === coverKey ? failedCovers.failedUrls : [];
  const loadableUrls = coverUrls.filter((url) => !failedUrls.includes(url));
  if (loadableUrls.length === 0) {
    return <span className={css.fallbackCover}>{fallbackIcon}</span>;
  }
  return (
    <StudioPlaylistCover
      coverUrls={loadableUrls}
      tint={tint}
      label=""
      radius={8}
      onLoadError={(failedUrl) =>
        setFailedCovers((current) => ({
          coverKey,
          failedUrls: [
            ...(current.coverKey === coverKey ? current.failedUrls : []),
            failedUrl,
          ],
        }))
      }
    />
  );
}

/** A rail row's body: the cover, then the name over its second line, the
 *  way a music library lists them. Folded, the cover stands alone and the
 *  name and second line stay for screen readers (the row's tooltip shows
 *  the name). The cover is decorative, so the link reads both lines.
 *  `meta` is the visible second line; `spokenMeta` is its folded wording. */
export function StudioRailRowBody({
  isCompact,
  cover,
  name,
  meta,
  spokenMeta,
}: {
  isCompact: boolean;
  cover: ReactNode;
  name: string;
  meta: ReactNode;
  spokenMeta: string;
}) {
  return (
    <>
      <span className={css.cover} aria-hidden>
        {cover}
      </span>
      {isCompact ? (
        <span className="visuallyHidden">
          {name}, {spokenMeta}
        </span>
      ) : (
        <span className={css.rowText}>
          <span className={css.name}>{name}</span>
          <span className={css.meta}>{meta}</span>
        </span>
      )}
    </>
  );
}
