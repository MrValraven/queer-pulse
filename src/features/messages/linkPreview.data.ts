import type { LinkPreviewResponse } from "../../shared/contracts/contracts";

/**
 * Demo-mode unfurl. The prototype must never hit the network, so instead of
 * fetching we synthesize a believable card from the URL itself. The thumbnail
 * is an inline SVG data URI (a soft plum→coral wash), so even the image layout
 * renders fully offline — no request leaves the browser in demo mode. Titles
 * for a couple of well-known hosts read naturally in the seeded demo thread;
 * any other URL falls back to a generic-but-plausible card.
 */

// A tiny gradient card thumbnail — inline so demo mode stays network-free.
const DEMO_THUMB =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#2d1b3d"/><stop offset="1" stop-color="#e8735a"/>` +
      `</linearGradient></defs><rect width="320" height="180" fill="url(#g)"/>` +
      `<circle cx="160" cy="90" r="34" fill="rgba(255,255,255,0.28)"/></svg>`,
  );

const SEEDED: Record<string, Omit<LinkPreviewResponse, "url">> = {
  "clinicadomarques.pt": {
    siteName: "Clínica do Marquês",
    title: "Book an appointment — Clínica do Marquês",
    description:
      "Trans-affirming primary care in central Lisbon. Request a first appointment by email; the team usually replies within two working days.",
    imageUrl: DEMO_THUMB,
  },
  "queerpulse.example": {
    siteName: "QueerPulse",
    title: "Pride Brunch 2026 — the whole terrace, 11am",
    description:
      "Our community brunch is confirmed. Save the date, bring a friend, and RSVP so we can plan the pastries.",
    imageUrl: DEMO_THUMB,
  },
};

/** A colocated mock preview for demo mode, derived from `url`. Never null — the
 *  demo card always renders so the feature is visible in the prototype. */
export function demoLinkPreview(url: string): LinkPreviewResponse {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    host = url;
  }
  const seeded = SEEDED[host];
  if (seeded) return { url, ...seeded };
  return {
    url,
    siteName: host || "Link",
    title: host ? `A page on ${host}` : "Shared link",
    description:
      "A preview of the page shared in this conversation. In the live app this is unfurled server-side from the page's own metadata.",
    imageUrl: DEMO_THUMB,
  };
}
