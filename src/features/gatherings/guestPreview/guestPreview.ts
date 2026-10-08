/**
 * Host "Preview as guest": the URL parameter and the three perspectives a
 * host or co-host can view their own gathering page as. The backend accepts
 * exactly these values on `GET /events/:slug?viewAs=`.
 */
export const GUEST_PREVIEW_PARAM = "viewAs";

/** Marks a subtree whose buttons keep working in preview (the preview bar). */
export const PREVIEW_ALLOW_ATTRIBUTE = "data-preview-allow";

export const GUEST_PREVIEW_ROLES = ["member", "going", "waitlisted"] as const;
export type GuestPreviewRole = (typeof GUEST_PREVIEW_ROLES)[number];

/** Any other value, or none, reads as "no preview". */
export function parseGuestPreviewRole(
  value: string | null,
): GuestPreviewRole | null {
  return GUEST_PREVIEW_ROLES.find((role) => role === value) ?? null;
}

/**
 * Which perspective, if any, the gathering page previews. `?viewAs=` counts
 * only for a live organiser of this gathering; for anyone else it is ignored
 * and never reaches the server.
 */
export function resolveGuestPreviewRole({
  isDemoMode,
  isViewerOrganizer,
  requestedViewAs,
}: {
  isDemoMode: boolean;
  isViewerOrganizer: boolean;
  requestedViewAs: string | null;
}): GuestPreviewRole | null {
  if (isDemoMode || !isViewerOrganizer) return null;
  return parseGuestPreviewRole(requestedViewAs);
}
