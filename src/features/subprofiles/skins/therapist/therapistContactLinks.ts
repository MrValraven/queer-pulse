import { safeHref } from "../../../../shared/lib/safeHref";

/** One address, no spaces, a dot in the domain: enough to refuse typos and
 *  anything that would change the meaning of a `mailto:` link. */
const EMAIL_PATTERN = /^[^\s@?#&]+@[^\s@?#&/]+\.[^\s@?#&/]+$/;

/** A `mailto:` href for an owner-typed email, or null when the value does not
 *  read as a single address. */
export function emailHref(email: string): string | null {
  const trimmed = email.trim();
  if (!EMAIL_PATTERN.test(trimmed)) return null;
  return safeHref(`mailto:${trimmed}`);
}

/** An owner-typed website ("sofianeves.pt") as a safe link: `https://` is
 *  added when no scheme was typed; anything else must pass `safeHref`. */
export function websiteHref(website: string): string | null {
  const trimmed = website.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const href = safeHref(hasScheme ? trimmed : `https://${trimmed}`);
  if (!href) return null;
  try {
    const url = new URL(href);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) {
      return null;
    }
  } catch {
    return null;
  }
  return href;
}

/** The website as people say it: no scheme, no `www.`, no trailing slash. */
export function websiteLabel(website: string): string {
  return website
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}
