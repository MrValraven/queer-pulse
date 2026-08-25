import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import { toAbsoluteUrl } from "../../shared/seo";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import type { SubprofileCardDTO } from "./api/subprofiles.api";

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

/**
 * `personaPublicPath`, but `null` when the persona has no resolvable address
 * yet. An unlinked draft with no handle has nowhere to live: `/p/:handle` only
 * ever resolves handles, so the `/p/<slug>` the function above falls back to is
 * a dead address the owner could read off their own preview and copy. Display
 * surfaces use this and say "no address yet" instead of inventing one.
 */
export function personaPublicPathOrNull(
  view: PublicSubprofileView,
): string | null {
  if (view.ownerSlug) return nestedPersonaPath(view.ownerSlug, view.slug);
  return view.handle ? personaPath(view.handle) : null;
}

/** Absolute, shareable URL for a persona (Share control + OG canonical/url). */
export function personaShareUrl(view: PublicSubprofileView): string {
  return toAbsoluteUrl(personaPublicPath(view));
}

/** Directory-card variant of `personaPublicPath`: routes a linked persona to its
 *  owner-nested URL, an unlinked one to its global handle. */
export function personaCardPath(card: SubprofileCardDTO): string {
  if (card.linkVisibility === "linked" && card.ownerSlug) {
    return nestedPersonaPath(card.ownerSlug, card.slug);
  }
  return personaPath(card.handle);
}

/**
 * Owner-dashboard variant: `SubprofileView` (the "my subprofiles" list) never
 * carries `ownerSlug`, so the caller passes it in.
 *
 * `ownerSlug` MUST be the persona's CREATOR (resolve it with
 * `usePersonaCreatorSlug`), never the signed-in member: `/subprofiles/mine`
 * returns co-owned personas too, and the nested public route resolves a linked
 * persona by its creator's profile only. Passing the viewer's slug builds a
 * 404 for every co-owner.
 */
export function personaPublicPathForOwner(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string,
): string {
  if (row.linkVisibility === "linked")
    return nestedPersonaPath(ownerSlug, row.slug);
  return personaPath(row.handle ?? row.slug);
}

/** Absolute, shareable URL for one of the signed-in owner's own personas. */
export function personaShareUrlForOwner(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string,
): string {
  return toAbsoluteUrl(personaPublicPathForOwner(row, ownerSlug));
}
