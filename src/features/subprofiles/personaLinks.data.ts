import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import { toAbsoluteUrl } from "../../shared/seo";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";

/**
 * The public URL path for a persona: an unlinked persona lives at the global
 * `/p/:handle` address; a linked persona is nested under its owner's main
 * profile at `/members/:ownerSlug/:slug` (spec §4 — an unlinked, pseudonymous
 * persona never reveals who is behind it, so it never resolves to the owner
 * path even if `ownerSlug` happened to be present).
 */
export function personaPublicPath(view: PublicSubprofileView): string {
  if (view.ownerSlug) return nestedPersonaPath(view.ownerSlug, view.slug);
  return personaPath(view.handle ?? view.slug);
}

/** Absolute, shareable URL for a persona (Share control + OG canonical/url). */
export function personaShareUrl(view: PublicSubprofileView): string {
  return toAbsoluteUrl(personaPublicPath(view));
}

/**
 * Owner-dashboard variant: `SubprofileView` (the "my subprofiles" list) never
 * carries `ownerSlug` — every row is implicitly owned by the signed-in
 * member, so the caller (`SideCard`) passes that member's slug in from
 * `useProfile()` rather than reading it off the row.
 */
export function personaPublicPathForOwner(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string,
): string {
  if (row.linkVisibility === "linked") return nestedPersonaPath(ownerSlug, row.slug);
  return personaPath(row.handle ?? row.slug);
}

/** Absolute, shareable URL for one of the signed-in owner's own personas. */
export function personaShareUrlForOwner(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string,
): string {
  return toAbsoluteUrl(personaPublicPathForOwner(row, ownerSlug));
}
