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
