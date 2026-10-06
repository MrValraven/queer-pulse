import { FiAward, FiClipboard, FiUsers } from "react-icons/fi";
import type { IconType } from "react-icons";

/** One "what the member side offers" pillar in the volunteer explainer. */
export interface VolunteerPillar {
  id: string;
  Icon: IconType;
  titleKey: string;
  bodyKey: string;
}

/**
 * PRD-454. What a member gets on the organising side of volunteering, in
 * display order, for the signed-out "Post an opportunity" and "Meet the change
 * makers" CTAs.
 *
 * The board behind this modal already says the rest: give two hours, the
 * organisations are vetted by the community, the activism guide, change makers
 * work on the causes you care about. Every row here is something that page
 * keeps quiet about, and each one is a real surface:
 *  - `post`: the post form plus the manage-applicants dashboard
 *    (`PostVolunteerOpportunityPage`, `VolunteerApplicantsDashboardPage`).
 *  - `record`: poster-confirmed sessions and hours
 *    (`VolunteerContributionCard`, `GET /volunteering/me/contribution`).
 *  - `changemakers`: the members-only change makers profiles.
 */
export const VOLUNTEER_PILLARS: VolunteerPillar[] = [
  {
    id: "post",
    Icon: FiClipboard,
    titleKey: "marketing:volunteerExplainer.pillars.post.title",
    bodyKey: "marketing:volunteerExplainer.pillars.post.body",
  },
  {
    id: "record",
    Icon: FiAward,
    titleKey: "marketing:volunteerExplainer.pillars.record.title",
    bodyKey: "marketing:volunteerExplainer.pillars.record.body",
  },
  {
    id: "changemakers",
    Icon: FiUsers,
    titleKey: "marketing:volunteerExplainer.pillars.changemakers.title",
    bodyKey: "marketing:volunteerExplainer.pillars.changemakers.body",
  },
];
