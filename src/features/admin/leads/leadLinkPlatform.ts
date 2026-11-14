import {
  LEAD_LINK_PLATFORMS,
  LEAD_WEBSITE_PLATFORM,
  type LeadLinkPlatform,
} from "./leadLinkPlatform.data";

export type {
  LeadLinkPlatform,
  LeadLinkPlatformId,
} from "./leadLinkPlatform.data";

/** The link's hostname with one leading `www.` removed, for display; null
 *  when the text does not parse as a link. */
export function leadLinkHost(link: string): string | null {
  try {
    const hostname = new URL(link.trim()).hostname;
    return hostname === "" ? null : hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** The platform a link points at: its host equals one of a platform's hosts
 *  or is a subdomain of one. A link that does not parse, or whose host is on
 *  no platform, reads as a website. */
export function leadLinkPlatform(link: string): LeadLinkPlatform {
  const host = leadLinkHost(link);
  if (host === null) return LEAD_WEBSITE_PLATFORM;
  const platform = LEAD_LINK_PLATFORMS.find((candidate) =>
    candidate.hosts.some(
      (platformHost) =>
        host === platformHost || host.endsWith(`.${platformHost}`),
    ),
  );
  return platform ?? LEAD_WEBSITE_PLATFORM;
}

/** How a link reads on the lead page: its host without one leading `www.`,
 *  then its path without trailing slashes. The scheme, query and fragment
 *  stay off the label. Text that does not parse as a link reads as typed. */
export function leadLinkAddressOf(link: string): string {
  const trimmed = link.trim();
  try {
    const url = new URL(trimmed);
    if (url.hostname === "") return trimmed;
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    return `${host}${path}`;
  } catch {
    return trimmed;
  }
}
