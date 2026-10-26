/**
 * Display names for the raw sources the landing counter records: a
 * `utm_source` value or the referrer's host. Matched after lowercasing and
 * dropping a leading `www.`; anything unlisted shows as recorded.
 */
const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  instagram: "Instagram",
  "instagram.com": "Instagram",
  "l.instagram.com": "Instagram",
  "t.co": "X (Twitter)",
  "x.com": "X (Twitter)",
  "twitter.com": "X (Twitter)",
  "linktr.ee": "Linktree",
  facebook: "Facebook",
  "facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  "l.facebook.com": "Facebook",
  google: "Google",
  "duckduckgo.com": "DuckDuckGo",
  "bing.com": "Bing",
  "reddit.com": "Reddit",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  tiktok: "TikTok",
  "tiktok.com": "TikTok",
  whatsapp: "WhatsApp",
  "whatsapp.com": "WhatsApp",
  "web.whatsapp.com": "WhatsApp",
  "wa.me": "WhatsApp",
};

/** Every Google country host (google.com, google.pt, google.co.uk). */
const GOOGLE_HOST = /^google\.[a-z]{2,3}(\.[a-z]{2})?$/;

/** The readable name for a recorded source, or the raw value when it is
 *  not one of the well-known ones. */
export function sourceDisplayName(source: string): string {
  const normalized = source.toLowerCase().replace(/^www\./, "");
  if (GOOGLE_HOST.test(normalized)) return "Google";
  return SOURCE_DISPLAY_NAMES[normalized] ?? source;
}
