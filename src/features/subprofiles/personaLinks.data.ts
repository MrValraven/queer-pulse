import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import { toAbsoluteUrl } from "../../shared/seo";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import type { SubprofileCardDTO } from "./api/subprofiles.api";

/**
 * Every persona's address builder in this module follows the same rule:
 *
 * 1. A handle always wins: once a persona holds one, its address is the
 *    global `/p/<handle>`, linked or not.
 * 2. Fallback, for a LINKED persona with no handle yet (a deploy gap, a row
 *    the backfill skipped, a demo fixture). The server stores a derived
 *    handle on every linked draft it saves, so a live one lands here only
 *    as a legacy row: the nested
 *    `/members/<creatorSlug>/<slug>`, which redirects to `/p/<handle>` once
 *    the persona is given one.
 * 3. An UNLINKED persona with no handle has no address at all: `null` /
 *    `"none"`. No builder here ever fabricates a `/p/<slug>` from the
 *    persona's per-owner slug, because that address resolves nowhere: an
 *    owner who copies a link or prints a QR code off their own dashboard must
 *    never get one that a stranger discovers dead weeks later.
 */
export function personaPublicPathOrNull(
  view: PublicSubprofileView,
): string | null {
  if (view.handle) return personaPath(view.handle);
  if (view.ownerSlug) return nestedPersonaPath(view.ownerSlug, view.slug);
  return null;
}

/** Absolute, shareable URL for a persona (Share control + OG canonical/url),
 *  or `null` when the persona has no public address yet. */
export function personaShareUrl(view: PublicSubprofileView): string | null {
  const path = personaPublicPathOrNull(view);
  return path ? toAbsoluteUrl(path) : null;
}

/** Directory-card variant of `personaPublicPathOrNull`: the handle once the
 *  card has one, else the owner-nested fallback for a linked card. */
export function personaCardPath(card: SubprofileCardDTO): string {
  if (card.handle) return personaPath(card.handle);
  if (card.linkVisibility === "linked" && card.ownerSlug) {
    return nestedPersonaPath(card.ownerSlug, card.slug);
  }
  return personaPath(card.handle);
}

/**
 * Owner-dashboard variant of `personaPublicPathOrNull`: `SubprofileView` (the
 * "my subprofiles" list) never carries `ownerSlug`, so the caller passes it in
 * for the nested fallback.
 *
 * `ownerSlug` MUST be the persona's CREATOR, resolved with
 * `usePersonaCreatorSlug` rather than read off the signed-in member:
 * `/subprofiles/mine` returns co-owned personas too, and the nested public
 * route resolves a linked persona by its creator's profile only. Passing
 * the viewer's slug builds a 404 for every co-owner.
 *
 * Returns `null` on the same rule as `personaPublicPathOrNull`: an unlinked
 * persona with no handle has no address, and View / Share / QR / vCard on the
 * dashboard must say so rather than hand out a dead `/p/<slug>`.
 */
export function personaPublicPathForOwnerOrNull(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string,
): string | null {
  if (row.handle) return personaPath(row.handle);
  if (row.linkVisibility === "linked")
    return nestedPersonaPath(ownerSlug, row.slug);
  return null;
}

/** Absolute, shareable URL for one of the signed-in owner's own personas, or
 *  `null` when that persona has no public address yet. */
export function personaShareUrlForOwner(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string,
): string | null {
  const path = personaPublicPathForOwnerOrNull(row, ownerSlug);
  return path ? toAbsoluteUrl(path) : null;
}

/**
 * The one answer the owner dashboard asks about a persona's address, in the
 * three states it can actually be in.
 *
 * `"ready"` is the ONLY shape that carries a path, so a caller cannot reach a
 * link without having handled the other two: View, Share, the QR code and the
 * vCard `URL:` line all read the same value and cannot drift into fabricating
 * `/p/<slug>` one affordance at a time.
 */
export interface PersonaResolvedAddress {
  /** In-app router path, for View. */
  path: string;
  /** Absolute URL, for the QR code, the vCard `URL:` line and copy-link. */
  shareUrl: string;
}

export type PersonaOwnerAddress =
  /** The creator slug a linked persona's nested fallback needs is still
   *  being fetched. */
  | { status: "pending" }
  /** Unlinked with no handle: this persona has no public address at all. */
  | { status: "none" }
  | ({ status: "ready" } & PersonaResolvedAddress);

function readyAddress(path: string): PersonaOwnerAddress {
  return { status: "ready", path, shareUrl: toAbsoluteUrl(path) };
}

/** Resolve an owner-dashboard row's public address. `ownerSlug` is the CREATOR's
 *  profile slug from `usePersonaCreatorSlug`, `undefined` while it resolves.
 *
 *  A row with a handle settles immediately, whether linked or not. Only the
 *  nested fallback for a handle-less LINKED row depends on that slug, so it
 *  is the only case that sits in `"pending"` behind a fetch. */
export function personaOwnerAddress(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string | undefined,
): PersonaOwnerAddress {
  if (row.handle) return readyAddress(personaPath(row.handle));
  if (row.linkVisibility !== "linked") return { status: "none" };
  if (!ownerSlug) return { status: "pending" };
  return readyAddress(nestedPersonaPath(ownerSlug, row.slug));
}

/** Showcase / highlight variant: the persona's handle, else the nested
 *  fallback under its own creator slug, else under the profile being viewed
 *  (the self view, whose owner list carries no per-persona owner). */
export function personaHrefWithOwnerFallback(
  persona: { handle?: string | null; slug: string; ownerSlug?: string | null },
  fallbackOwnerSlug: string,
): string {
  if (persona.handle) return personaPath(persona.handle);
  return nestedPersonaPath(
    persona.ownerSlug ?? fallbackOwnerSlug,
    persona.slug,
  );
}
