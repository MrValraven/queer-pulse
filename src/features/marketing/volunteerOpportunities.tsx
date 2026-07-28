import { VOLUNTEER_OPPORTUNITIES } from "./volunteerOpportunities.data";
import type { VolunteerOpportunity } from "./volunteerOpportunities.types";

export type {
  VolunteerCause,
  VolunteerCommit,
  TeamMember,
  VolunteerOpportunity,
} from "./volunteerOpportunities.types";

export { VOLUNTEER_OPPORTUNITIES };

export function getOpportunity(
  slug: string | undefined,
): VolunteerOpportunity | undefined {
  return VOLUNTEER_OPPORTUNITIES.find((o) => o.slug === slug);
}
