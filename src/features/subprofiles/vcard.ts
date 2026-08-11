import { toAbsoluteUrl } from "../../shared/seo";
import { downloadBlob } from "../../shared/lib/downloadBlob";
import { socialHref } from "../../shared/social/socialPlatforms";
import { personaShareUrl } from "./personaLinks.data";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/** Escape the characters vCard (RFC 6350) reserves in a text value:
 *  backslash, comma, semicolon, then a literal newline as `\n`. Order
 *  matters — the backslash itself must be escaped first, or the escapes
 *  added for the other characters would be double-escaped. */
export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Build a VERSION:3.0 vCard for a persona's public view — a portable contact
 * card a scanner/contacts app can import directly from the QR/download flow.
 * Pure and synchronous so it's trivially testable and safe to call from a
 * click handler with no loading state.
 */
export function buildVCard(view: PublicSubprofileView): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${escapeVCard(view.displayName)}`);
  lines.push(`N:${escapeVCard(view.displayName)};;;;`);

  if (view.tagline) lines.push(`TITLE:${escapeVCard(view.tagline)}`);

  // First affiliation ("Part of …") as the vCard organisation — the closest
  // thing a persona has to an employer/collective for a contacts app.
  const primaryAffiliation = view.affiliations[0];
  if (primaryAffiliation?.name) {
    lines.push(`ORG:${escapeVCard(primaryAffiliation.name)}`);
  }

  lines.push(`URL:${personaShareUrl(view)}`);

  if (view.avatarUrl) {
    lines.push(`PHOTO;VALUE=URI:${toAbsoluteUrl(view.avatarUrl)}`);
  }

  for (const link of view.socialLinks) {
    const href = socialHref(link.platform, link.urlOrHandle);
    if (!href) continue;
    lines.push(`URL:${href}`);
    if (link.platform === "email") {
      lines.push(`EMAIL:${escapeVCard(link.urlOrHandle.replace(/^mailto:/i, ""))}`);
    }
  }

  if (view.bio) lines.push(`NOTE:${escapeVCard(view.bio)}`);

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/** Build the vCard for `view` and trigger a browser download of it as a
 *  `.vcf` file, named after the persona's slug/handle. Client-only — no
 *  network round-trip, works identically in demo and live mode. */
export function downloadVCard(view: PublicSubprofileView): void {
  const filename = `${view.slug || view.handle || "persona"}.vcf`;
  downloadBlob(filename, buildVCard(view), "text/vcard");
}
