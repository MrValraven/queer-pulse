/** The copy's image type; a browser that cannot encode it falls back to PNG. */
const COPY_TYPE = "image/webp";
const COPY_QUALITY = 0.92;
/** The longest side of a copy in pixels: it is an on-screen preview only. */
export const COPY_MAX_SIDE = 1600;

/**
 * A copy of a just picked picture under a `blob:` URL the draft owns.
 *
 * The picture field revokes its own preview URL when it unmounts, so a
 * question closed and opened again would show a dead image. The copy is drawn
 * through a canvas because the site's CSP leaves `blob:` out of connect-src,
 * which refuses a fetch of the field's URL. Resolves null when the browser
 * cannot decode or encode the picture, and the slot keeps its earlier
 * fallback (the saved URL or the picture key).
 */
export async function copyPicturePreview(
  sourceUrl: string,
): Promise<string | null> {
  try {
    const image = new Image();
    image.src = sourceUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    const scale = Math.min(
      1,
      COPY_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context === null) return null;
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, COPY_TYPE, COPY_QUALITY);
    });
    return blob === null ? null : URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
