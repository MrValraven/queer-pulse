import { useState } from "react";
import type { Tint } from "../marketing/directoryPlaces";
import { initialsForName, tintForSlug } from "./api/listingPreviewPlace";
import type { ListingQueueRow } from "./api/adminListings.api";
import styles from "./AdminListingRows.module.css";

const TINT_CLASS: Record<Tint, string | undefined> = {
  coral: styles.tintCoral,
  jade: styles.tintJade,
  plum: styles.tintPlum,
};

/**
 * A queue row's visual anchor: the listing's lead photo, or its two-letter
 * initials on the listing's own tint (the same tint the public page uses)
 * when it has no photo or the photo fails to load. Decorative, because the
 * listing's name sits right beside it.
 */
export function ListingRowThumb({ row }: { row: ListingQueueRow }) {
  const photos = row.detail.photos;
  // `||` so an empty-string slot also falls through to the next photo.
  const photoUrl = photos.wide || photos.d1 || photos.vibe || photos.d2 || null;
  // Keyed to the URL, so a row whose photo changes gets a fresh attempt.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (photoUrl && photoUrl !== failedUrl) {
    return (
      <img
        className={`${styles.cellThumb} ${styles.thumb}`}
        src={photoUrl}
        alt=""
        aria-hidden="true"
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(photoUrl)}
      />
    );
  }
  return (
    <span
      className={[
        styles.cellThumb,
        styles.thumb,
        TINT_CLASS[tintForSlug(row.slug)],
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {initialsForName(row.name)}
    </span>
  );
}
