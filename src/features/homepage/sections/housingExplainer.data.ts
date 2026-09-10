import { FiLock, FiMapPin, FiUsers } from "react-icons/fi";
import type { IconType } from "react-icons";

/** One "how housing works here" pillar in the signed-out explainer modal. */
export interface HousingPillar {
  id: string;
  Icon: IconType;
  titleKey: string;
  bodyKey: string;
}

/**
 * The three parts of the housing offer a signed-out visitor cannot see, in
 * display order.
 *
 * The showcase section around this modal already makes the pitch — rooms,
 * sublets and flatmates from members, recommendations from people who actually
 * lived there, one trusted network, landlord reviews written by past tenants,
 * a trans-affirming household, deposit terms in writing, the rent set against
 * the local median. NONE of that is repeated here: a visitor opens this modal
 * having just read all of it, and a modal that says it again reads as a wall
 * rather than an answer. Every row below is something the section does not say,
 * and every row is grounded in code:
 *
 *  - `groups`: the vetted housing groups directory (`routes.housingGroups`,
 *    `/local/housing/groups`). Small screened groups with their own stewards
 *    and house rules; the rooms shared inside one stay inside it, which is what
 *    `housingGroups.listings.locked.*` renders to everyone else.
 *  - `viewings`: `HousingViewingsPage` plus the listing's location block. A
 *    listing shows its rough area until access is granted, and the exact street
 *    address is released to the owner, a connected member or an ACCEPTED viewer
 *    (`housingListing.location.approxNote` / `exactNote`). Afterwards both
 *    sides write a two-sided blind review (`housingReviews.api.ts`).
 *  - `door`: `/local/housing` and `/local/housing/*` sit in `GATED_PATTERNS`
 *    because the backend browse is `ActiveMemberGuard`ed. This is the honest
 *    answer to "why can't I just look?", and the "Renting, safely" scam and
 *    tenant-rights guide (`/local/housing/rights`) is behind the same door.
 */
export const HOUSING_PILLARS: HousingPillar[] = [
  {
    id: "groups",
    Icon: FiUsers,
    titleKey: "homepage:housingExplainer.pillars.groups.title",
    bodyKey: "homepage:housingExplainer.pillars.groups.body",
  },
  {
    id: "viewings",
    Icon: FiMapPin,
    titleKey: "homepage:housingExplainer.pillars.viewings.title",
    bodyKey: "homepage:housingExplainer.pillars.viewings.body",
  },
  {
    id: "door",
    Icon: FiLock,
    titleKey: "homepage:housingExplainer.pillars.door.title",
    bodyKey: "homepage:housingExplainer.pillars.door.body",
  },
];
