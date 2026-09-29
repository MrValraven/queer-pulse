import type { Visibility } from "./api/subprofiles.api";

/**
 * Follow and endorse accept an `open` persona only: the backend gates both
 * (and the endorser list for a non-owner) on `visibility = open`. A
 * members-only (`network`) persona therefore shows no Follow or Endorse
 * control, live or as an inert look-alike, since either would fail on tap.
 */
export function isPersonaOpenToEngagement(persona: {
  visibility: Visibility;
}): boolean {
  return persona.visibility === "open";
}

/**
 * Whether the endorser list may be requested. The backend answers a co-owner
 * on any persona and everyone else on an `open` persona only.
 * `isOwnerReading` is true for a co-owner reading as themselves; pass false
 * while the owner previews the page as a visitor, so the preview requests
 * only what a visitor could.
 */
export function canReadPersonaEndorsers(
  persona: { visibility: Visibility },
  isOwnerReading: boolean,
): boolean {
  return isOwnerReading || isPersonaOpenToEngagement(persona);
}
