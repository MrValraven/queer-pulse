import { VOLUNTEER_OPPORTUNITIES_A } from "./volunteerOpportunities.dataA";
import { VOLUNTEER_OPPORTUNITIES_B } from "./volunteerOpportunities.dataB";
import type { VolunteerOpportunity } from "./volunteerOpportunities.types";

export type {
  VolunteerCause,
  VolunteerCommit,
  TeamMember,
  VolunteerOpportunity,
} from "./volunteerOpportunities.types";

export const VOLUNTEER_OPPORTUNITIES: VolunteerOpportunity[] = [
  ...VOLUNTEER_OPPORTUNITIES_A,
  ...VOLUNTEER_OPPORTUNITIES_B,
];

export function getOpportunity(
  slug: string | undefined,
): VolunteerOpportunity | undefined {
  return VOLUNTEER_OPPORTUNITIES.find((o) => o.slug === slug);
}
