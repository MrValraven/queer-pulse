import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import { toAbsoluteUrl } from "../../shared/seo";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import type { SubprofileCardDTO } from "./api/subprofiles.api";

/**
 * The public URL path for a persona, or `null` when it has no resolvable
 * address yet.
 *
 * A persona has exactly two possible addresses. A LINKED persona is nested
 * under its owner's main profile at `/members/:ownerSlug/:slug`. An UNLINKED
 * one lives at the global `/p/:handle` (spec §4: a pseudonymous persona never
 * reveals who is behind it, so it never resolves to the owner path even if
 * `ownerSlug` happened to be present).
 *
 * An unlinked persona with no handle yet has NEITHER address: it was never
 * published, or it was unpublished, which releases the handle. `/p/:handle`
 * resolves
 * handles only, so a `/p/<slug>` built from the persona's per-owner slug is a
 * dead link. Every builder in this module therefore returns `null` in that case
 * and no caller can fabricate one: an owner who copies a link or prints a QR
 * code off their own dashboard must never get an address that resolves nowhere,
 * because a stranger discovers that weeks later with nothing to fall back on.
 */
export function personaPublicPathOrNull(
  view: PublicSubprofileView,
): string | null {
  if (view.ownerSlug) return nestedPersonaPath(view.ownerSlug, view.slug);
  return view.handle ? personaPath(view.handle) : null;
}

/** Absolute, shareable URL for a persona (Share control + OG canonical/url),
 *  or `null` when the persona has no public address yet. */
export function personaShareUrl(view: PublicSubprofileView): string | null {
  const path = personaPublicPathOrNull(view);
  return path ? toAbsoluteUrl(path) : null;
}

/** Directory-card variant of `personaPublicPathOrNull`: routes a linked persona to its
 *  owner-nested URL, an unlinked one to its global handle. */
export function personaCardPath(card: SubprofileCardDTO): string {
  if (card.linkVisibility === "linked" && card.ownerSlug) {
    return nestedPersonaPath(card.ownerSlug, card.slug);
  }
  return personaPath(card.handle);
}

/**
 * Owner-dashboard variant of `personaPublicPathOrNull`: `SubprofileView` (the
 * "my subprofiles" list) never carries `ownerSlug`, so the caller passes it in.
 *
 * `ownerSlug` MUST be the persona's CREATOR (resolve it with
 * `usePersonaCreatorSlug`), never the signed-in member: `/subprofiles/mine`
 * returns co-owned personas too, and the nested public route resolves a linked
 * persona by its creator's profile only. Passing the viewer's slug builds a
 * 404 for every co-owner.
 *
 * Returns `null` on the same rule as `personaPublicPathOrNull`: an unlinked
 * persona with no handle has no address, and View / Share / QR / vCard on the
 * dashboard must say so rather than hand out a dead `/p/<slug>`.
 */
export function personaPublicPathForOwnerOrNull(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string,
): string | null {
  if (row.linkVisibility === "linked")
    return nestedPersonaPath(ownerSlug, row.slug);
  return row.handle ? personaPath(row.handle) : null;
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
  /** The creator slug a linked persona's address needs is still being fetched. */
  | { status: "pending" }
  /** Unlinked with no handle: this persona has no public address at all. */
  | { status: "none" }
  | ({ status: "ready" } & PersonaResolvedAddress);

/** Resolve an owner-dashboard row's public address. `ownerSlug` is the CREATOR's
 *  profile slug from `usePersonaCreatorSlug`, `undefined` while it resolves.
 *
 *  Only a LINKED persona's address depends on that slug. An unlinked one is
 *  answered by its handle alone, so it settles immediately rather than sitting
 *  in `"pending"` behind a fetch its answer never needed. */
export function personaOwnerAddress(
  row: Pick<SubprofileView, "handle" | "slug" | "linkVisibility">,
  ownerSlug: string | undefined,
): PersonaOwnerAddress {
  if (row.linkVisibility === "linked") {
    if (!ownerSlug) return { status: "pending" };
    const nested = nestedPersonaPath(ownerSlug, row.slug);
    return { status: "ready", path: nested, shareUrl: toAbsoluteUrl(nested) };
  }
  if (!row.handle) return { status: "none" };
  const standalone = personaPath(row.handle);
  return {
    status: "ready",
    path: standalone,
    shareUrl: toAbsoluteUrl(standalone),
  };
}
