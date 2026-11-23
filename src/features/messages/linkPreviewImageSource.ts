import { API_BASE_URL } from "../../shared/api/config";

/** The API route that serves a link preview's image (SEC-23). */
const LINK_PREVIEW_IMAGE_PATH_PREFIX = "/link-preview-images/";

/**
 * Whether a link preview card's `imageUrl` may be loaded by the browser.
 *
 * SEC-23: the server now hands out its own signed image address, so the
 * reader's browser never contacts the host the sender chose. This check keeps
 * that true on the client too: a card from an older cache entry, or any answer
 * still carrying a third-party URL, renders without its image. Two sources
 * pass:
 *  - the API's own `/link-preview-images/` route, on the API origin;
 *  - an inline `data:image/` URI (the demo thumbnail), which makes no request.
 */
export function isLoadableLinkPreviewImage(
  imageUrl: string | null | undefined,
): imageUrl is string {
  if (!imageUrl) return false;
  if (imageUrl.startsWith("data:image/")) return true;
  if (!API_BASE_URL) return false;
  try {
    const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
    const image = new URL(imageUrl);
    return (
      image.origin === apiOrigin &&
      image.pathname.startsWith(LINK_PREVIEW_IMAGE_PATH_PREFIX)
    );
  } catch {
    return false;
  }
}
