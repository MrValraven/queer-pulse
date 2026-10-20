import { routes } from "../../app/routeMap";

// Studio safety: links to the claim pages, as studioPaths.ts builds the
// other Studio links.

export function studioClaimsPath(claimId?: string): string {
  return claimId
    ? `${routes.studioClaims}?claim=${encodeURIComponent(claimId)}`
    : routes.studioClaims;
}

export function studioClaimNewPath(
  subject: { trackId: string } | { releaseId: string },
): string {
  return "trackId" in subject
    ? `${routes.studioClaimNew}?track=${encodeURIComponent(subject.trackId)}`
    : `${routes.studioClaimNew}?release=${encodeURIComponent(subject.releaseId)}`;
}
