import { VOLUNTEER_OPPORTUNITIES } from "./volunteerOpportunities.data";
import type { VolunteerOpportunity } from "./volunteerOpportunities.types";

/** Find a volunteer opportunity by slug. Split out of volunteerOpportunities.tsx
 * so that barrel file only re-exports types + data
 * (react-refresh/only-export-components). */
export function getOpportunity(
  slug: string | undefined,
): VolunteerOpportunity | undefined {
  return VOLUNTEER_OPPORTUNITIES.find((o) => o.slug === slug);
}
