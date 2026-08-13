/**
 * A listing's `gallery` array is overloaded by mode: in live mode each entry is
 * a resolved image URL; in demo fixtures each entry is a caption string (the
 * prototype's tinted-placeholder treatment). Normalise either into a photo the
 * grid + lightbox can render — a real `<img>` when it's a URL, a captioned
 * tinted frame otherwise.
 */
export interface GalleryPhoto {
  /** Present when the entry is a real image URL. */
  src?: string;
  /** The caption/label for a placeholder entry (demo), else undefined. */
  caption?: string;
}

/** Whether a gallery entry is a real image URL rather than a caption string. */
export function isImageUrl(entry: string): boolean {
  return /^(https?:)?\/\//.test(entry) || entry.startsWith("/");
}

export function buildGalleryPhotos(gallery: string[]): GalleryPhoto[] {
  return gallery.map((entry) =>
    isImageUrl(entry) ? { src: entry } : { caption: entry },
  );
}
