import { routes } from "../../../app/routeMap";

/**
 * Where a prospective member came through on their way to the invite request
 * form. There is one form (RequestInvitePage) but many CTAs across the app point
 * at it, and until now the admin review queue could not tell them apart. Each
 * CTA tags its link with one of these stable keys (via {@link requestInvitePath});
 * the form carries it into the submission, and the mod queue shows a "came from"
 * line so a reviewer can see which surface prompted the ask.
 *
 * These keys are the wire contract with the backend's nullable `source` column,
 * so treat them as append-only: add a new one when a new CTA is added, never
 * rename an existing one (old rows would stop resolving to a label).
 */
export const JOIN_REQUEST_SOURCES = [
  "homepage_hero",
  "homepage_outro",
  "members_explainer",
  "sign_in",
  "barter",
  "employer_reviews",
  "skills",
  "solidarity_directory",
  "solidarity",
  "public_profile",
  "about",
  "directory",
  "partners",
  "arriving",
  "communities_about",
  "accessibility",
  "wellbeing",
  "trans_hub",
  "legal",
  "micro_grants",
  "queer_101",
  "magazine",
  "status",
  "gathering_vouch",
  "family",
  "reading_groups",
] as const;

export type JoinRequestSource = (typeof JOIN_REQUEST_SOURCES)[number];

const KNOWN = new Set<string>(JOIN_REQUEST_SOURCES);

/**
 * The invite request route tagged with the CTA the member is coming from, e.g.
 * `/auth/request-invite?from=skills`. Used everywhere a CTA links to the form —
 * a query param (not router state) so the origin survives a refresh or a shared
 * link. The bare `routes.requestInvite` still works and simply records no source.
 */
export function requestInvitePath(source: JoinRequestSource): string {
  return `${routes.requestInvite}?from=${source}`;
}

/**
 * Read a `?from=` value back into a known source key. Returns null for a missing
 * or unrecognised value so an arbitrary/stale param is never stored — the queue
 * treats "no known source" as a direct visit rather than echoing junk.
 */
export function parseJoinRequestSource(
  raw: string | null | undefined,
): JoinRequestSource | null {
  return raw && KNOWN.has(raw) ? (raw as JoinRequestSource) : null;
}

/**
 * The i18n key for a source's friendly admin-queue label. A recognised key maps
 * to `admin:members.verify.source.<key>`; null (direct visit) and any unknown
 * value fall back to neutral catalog entries, so the queue always has a label.
 */
export function sourceLabelKey(source: string | null): string {
  if (source === null) return "admin:members.verify.source.direct";
  if (KNOWN.has(source)) return `admin:members.verify.source.${source}`;
  return "admin:members.verify.source.other";
}
