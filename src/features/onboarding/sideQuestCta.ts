import { routes } from "../../app/routeMap";

/**
 * Maps a locked badge's `key` to where a member can go to work toward it.
 * Mirrors `badgeIcons.tsx`'s key->icon registry: matched by the stable
 * catalog key, kept in sync with the backend by hand. A badge with no entry
 * here has no single actionable place to send someone — it's earned
 * passively over time (`decade`, `sustainer`, `regular-attendee` still
 * benefit from "go to gatherings" even though the badge itself takes
 * repeated visits) or is no longer obtainable after signup
 * (`founding-member`). `SideQuests` renders those without a CTA button
 * rather than a broken or misleading link.
 */
const SIDE_QUEST_ROUTE_BY_BADGE_KEY: Record<string, string> = {
  "first-gathering": routes.gatherings,
  "three-company": routes.gatherings,
  "regular-attendee": routes.gatherings,
  decade: routes.gatherings,
  connector: routes.members,
  vouch: routes.members,
  "thread-starter": routes.communities,
  networker: routes.members,
  contributor: routes.submitStory,
  "event-host": routes.host,
  "serial-host": routes.host,
  "local-scout": routes.directory,
  "well-read": routes.resources,
  "two-homes": routes.communities,
  "work-ready": routes.workProfile,
};

export function sideQuestRouteFor(key: string): string | undefined {
  return SIDE_QUEST_ROUTE_BY_BADGE_KEY[key];
}
