import type { BadgeTone } from "../../shared/components/ui";
import type {
  AdminHousingListingDTO,
  HousingListingDecisionAction,
} from "./api/adminHousingListings.api";

/** The pill each moderation state renders as, shared by the queue's tabs and
 * its rows so one state never reads two different ways in the same console. */
export const STATUS_BADGE: Record<
  AdminHousingListingDTO["status"],
  { labelKey: string; tone: BadgeTone }
> = {
  review: { labelKey: "admin:housingListings.status.review", tone: "amber" },
  question: {
    labelKey: "admin:housingListings.status.question",
    tone: "coral",
  },
  live: { labelKey: "admin:housingListings.status.live", tone: "jade" },
  rejected: {
    labelKey: "admin:housingListings.status.rejected",
    tone: "danger",
  },
  taken_down: {
    labelKey: "admin:housingListings.status.takenDown",
    tone: "danger",
  },
};

/**
 * Which decisions the backend will accept for a listing in each state.
 *
 * A re-decision into the state a listing is already in is refused server-side,
 * and a take-down is only legal on something that is actually live, so the
 * console offers exactly what will work rather than a button that 400s.
 */
export function allowedDecisions(
  status: AdminHousingListingDTO["status"],
): HousingListingDecisionAction[] {
  const allowed: HousingListingDecisionAction[] = [];
  if (status !== "live") allowed.push("approve");
  if (status !== "question") allowed.push("request_changes");
  if (status !== "rejected") allowed.push("reject");
  if (status === "live") allowed.push("take_down");
  return allowed;
}
