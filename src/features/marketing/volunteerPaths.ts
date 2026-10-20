import { communityPath, routes } from "../../app/routeMap";

/**
 * The volunteering paths in one place. The opportunity detail URL used to be
 * spelled out by hand in every card, flow and sidebar that linked to it; these
 * builders are the single source the router and every link share.
 */

/** The opportunity detail route pattern, as the router registers it. */
export const VOLUNTEER_OPPORTUNITY_ROUTE = `${routes.volunteer}/opportunity/:slug`;

/** One opportunity's detail page (`/about/volunteer/opportunity/:slug`). */
export function volunteerOpportunityPath(slug: string): string {
  return `${routes.volunteer}/opportunity/${encodeURIComponent(slug)}`;
}

/** The query param the post form reads to preselect a community. */
export const POST_OPPORTUNITY_COMMUNITY_PARAM = "community";

/** The post form, with a community preselected when its slug is given. */
export function postOpportunityPath(communitySlug?: string): string {
  if (!communitySlug) return routes.postVolunteer;
  const searchParams = new URLSearchParams({
    [POST_OPPORTUNITY_COMMUNITY_PARAM]: communitySlug,
  });
  return `${routes.postVolunteer}?${searchParams.toString()}`;
}

/** A community page opened on its Volunteering tab. */
export function communityVolunteeringTabPath(slug: string): string {
  return `${communityPath(slug)}?tab=volunteering`;
}

/**
 * Router location state a community's Volunteering tab hands the detail page,
 * so its back link returns to that tab. It lives in history state, which a
 * shared or copied link never carries.
 */
export interface OpportunityBackState {
  backToCommunity: { slug: string; name: string };
}

export function opportunityBackState(
  slug: string,
  name: string,
): OpportunityBackState {
  return { backToCommunity: { slug, name } };
}

const COMMUNITY_SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * Reads the back target out of `useLocation().state`, which is `unknown`:
 * history state survives reloads and can hold anything an older build wrote.
 * Answers null unless both fields are strings, the slug is a plain community
 * slug and the name has text to show.
 */
export function opportunityBackTargetFrom(
  state: unknown,
): { slug: string; name: string } | null {
  if (typeof state !== "object" || state === null) return null;
  const backToCommunity = (state as { backToCommunity?: unknown })
    .backToCommunity;
  if (typeof backToCommunity !== "object" || backToCommunity === null) {
    return null;
  }
  const { slug, name } = backToCommunity as { slug?: unknown; name?: unknown };
  if (typeof slug !== "string" || typeof name !== "string") return null;
  if (!COMMUNITY_SLUG_PATTERN.test(slug) || name.trim() === "") return null;
  return { slug, name };
}
