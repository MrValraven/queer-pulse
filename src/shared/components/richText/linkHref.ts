import { ALLOWED_HREF_PROTOCOLS } from "./sanitizeArticleHtml";

/**
 * Turns what a writer typed into the toolbar's link field into an href the
 * reader's sanitizer will actually keep, or `null` when it cannot.
 *
 * This is the same allowlist `sanitizeArticleHtml` enforces on read
 * (`http:`/`https:`/`mailto:`), applied at the point the link is created — so
 * the editor can refuse a link up front instead of letting the writer save
 * markup that is silently unwrapped on the public page. A bare host like
 * `example.com` is treated as `https://example.com`, which is what a writer
 * pasting from an address bar means.
 */
export function normalizeLinkHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (!ALLOWED_HREF_PROTOCOLS.has(url.protocol)) return null;
    // A scheme with nothing behind it ("https://") is what the old
    // placeholder produced: a link the reader always drops.
    if (url.protocol !== "mailto:" && !url.hostname) return null;
    if (url.protocol === "mailto:" && !url.pathname.includes("@")) return null;
    return url.href;
  } catch {
    return null;
  }
}
