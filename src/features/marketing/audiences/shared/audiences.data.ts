import type { IconType } from "react-icons";
import { routes } from "../../../../app/routeMap";
import type { JoinRequestSource } from "../../../auth/api/joinRequestSource";
import type { SubprofileKind } from "../../../subprofiles/api/subprofiles.api";

/** The four audiences with an unlisted landing page under `/for/*`. */
export type AudienceId =
  "businesses" | "communities" | "performers" | "practitioners";

/** The invite-request source each page tags its hero and closing CTA with. */
export const AUDIENCE_SOURCES: Record<AudienceId, JoinRequestSource> = {
  businesses: "for_businesses",
  communities: "for_communities",
  performers: "for_performers",
  practitioners: "for_practitioners",
};

/** The walkthrough section's id, the hero's "See how it works" anchor. */
export const AUDIENCE_WALKTHROUGH_ID = "how-it-works";

/** The walkthrough heading, which takes focus after the anchor scrolls. */
export const AUDIENCE_WALKTHROUGH_HEADING_ID = "how-it-works-heading";

/**
 * The persona dashboard with its create modal open on `kind`, the deep link
 * `MySubprofilesPage` reads on mount (`?create=1&kind=`).
 */
export function createPersonaPath(kind: SubprofileKind): string {
  return `${routes.subprofilesDashboard}?create=1&kind=${kind}`;
}

/** A direct action a signed-in member gets in place of the invite request. */
export interface AudienceMemberAction {
  actionId: string;
  label: string;
  to: string;
}

/** One row of the before/after block. */
export interface AudienceListItem {
  itemId: string;
  labelKey: string;
  Icon: IconType;
}

/** One card of a point grid (the "Safe by design" section, for one). */
export interface AudiencePoint {
  pointId: string;
  titleKey: string;
  bodyKey: string;
  Icon: IconType;
}

/** One question of the FAQ accordion. */
export interface AudienceFaqItem {
  faqId: string;
  questionKey: string;
  answerKey: string;
}

/** One choice of a "Try it" switch. */
export interface TryItOption<OptionId extends string> {
  id: OptionId;
  label: string;
  Icon?: IconType;
}
