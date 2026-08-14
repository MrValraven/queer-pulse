/**
 * Base SEO defaults for QueerPulse.
 *
 * These are the *neutral, brand-level* fallbacks used by any route that does not
 * render its own <PageMeta>. They must NOT be invite-specific — the static
 * `index.html` shell (served to every route + every social scraper) mirrors
 * these exact values, so if this said "You've been invited…" every shared link
 * would misrepresent itself. See docs/production-readiness/15-seo-and-metadata.md.
 */

/**
 * Canonical production origin, used to build absolute canonical / og:url /
 * sitemap URLs. Purely for URL construction — it does NOT depend on the API
 * layer (`VITE_API_URL` / demo mode), so meta renders identically in demo and
 * live. Override at build time with `VITE_SITE_ORIGIN`.
 */
const envOrigin = import.meta.env.VITE_SITE_ORIGIN as string | undefined;
export const SITE_ORIGIN: string =
  envOrigin && envOrigin.length > 0 ? envOrigin : "https://queerpulse.com";

export interface DefaultMeta {
  siteName: string;
  title: string;
  description: string;
  /** Root-relative path to the self-hosted default social image (in public/). */
  image: string;
  twitterCard: string;
  twitterHandle: string;
  locale: string;
}

export const defaultMeta: DefaultMeta = {
  siteName: "QueerPulse",
  title: "QueerPulse: a queer professional network, rooted in Lisbon",
  description:
    "QueerPulse: a quiet, vouched-for network for LGBTQ+ professionals, creatives and community in Lisbon. No ads, no algorithm.",
  image: "/og-default.png",
  twitterCard: "summary_large_image",
  twitterHandle: "@queerpulse",
  locale: "en_GB",
};

/** Turn a root-relative path or an already-absolute URL into an absolute URL. */
export function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}
