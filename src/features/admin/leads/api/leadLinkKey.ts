/**
 * Hosts whose query string is tracking noise. A link on one of them, or on
 * any subdomain of one, keys without its query (a YouTube watch page keeps
 * its `v`). Mirror of the backend's `src/leads/lead-link-key.ts`.
 */
export const LEAD_SOCIAL_HOSTS = [
  "instagram.com",
  "tiktok.com",
  "soundcloud.com",
  "spotify.com",
  "bandcamp.com",
  "youtube.com",
  "youtu.be",
  "facebook.com",
  "fb.com",
  "x.com",
  "twitter.com",
  "ra.co",
  "residentadvisor.net",
  "mixcloud.com",
] as const;

const SOCIAL_HOSTS: readonly string[] = LEAD_SOCIAL_HOSTS;

function isSocialHost(hostname: string): boolean {
  return SOCIAL_HOSTS.some(
    (socialHost) =>
      hostname === socialHost || hostname.endsWith(`.${socialHost}`),
  );
}

function isYouTubeHost(hostname: string): boolean {
  return hostname === "youtube.com" || hostname.endsWith(".youtube.com");
}

/**
 * The identity of a link, used to spot the same link on two leads
 * (`LEAD_LINK_TAKEN`) and to drop a repeat inside one request. Two spellings
 * of one page share a key: scheme, fragment, one leading `www.`, trailing
 * slashes and a social host's tracking query all fall away. Host case folds,
 * path case stays. `null` means the text is no `http:` or `https:` URL with
 * a host, which the caller answers with `LEAD_LINK_INVALID`.
 *
 * Contract section 5, steps 1 to 7, with the same output as the backend for
 * the same input (the demo store keys links with it).
 */
export function leadLinkKey(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.hostname === "") return null;
  const hostname = url.hostname.replace(/^www\./, "");
  const host = url.port === "" ? hostname : `${hostname}:${url.port}`;
  const path = url.pathname.replace(/\/+$/, "");
  let query: string;
  if (!isSocialHost(hostname)) {
    query = url.search;
  } else if (isYouTubeHost(hostname) && path === "/watch") {
    const videoId = url.searchParams.get("v");
    query = videoId === null ? "" : `?v=${videoId}`;
  } else {
    query = "";
  }
  return host + path + query;
}
