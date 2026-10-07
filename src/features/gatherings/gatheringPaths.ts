/**
 * Pure path builders for gathering pages, kept apart from the `data.ts` mock
 * module so a light caller (an `e/` mention, a share link) links to a
 * gathering without pulling the gatherings and members mocks into its chunk.
 * `data.ts` re-exports every one of them for existing importers.
 */
import { routes } from "../../app/routeMap";
import { appHost, appOrigin } from "../../shared/lib/inviteUrl";

// ── Gathering detail routing: /gatherings/<slug>-<shortId> ──
// Canonical convention. The shortId stands in for a real per-event id and is
// derived deterministically from the slug so links stay stable.

/** Stable 5-char short id derived from a slug. */
export function gatheringShortId(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 5).padStart(5, "0");
}

/**
 * The real slug behind a `:slug` route param. Our own links carry
 * `<slug>-<shortId>`, but backend-built links (feed items, notifications,
 * reminders, profile activity) carry the bare slug, and backend slugs hold
 * hyphens of their own (`queerpulse-gamenight`, `my-event-a1b2c3`). So only a
 * final segment that IS the prefix's own short id is stripped; any other param
 * is already the slug and comes back unchanged.
 */
export function gatheringSlugFromParam(param: string): string {
  const lastHyphenIndex = param.lastIndexOf("-");
  if (lastHyphenIndex <= 0) return param;
  const slugPrefix = param.slice(0, lastHyphenIndex);
  const suffix = param.slice(lastHyphenIndex + 1);
  return suffix === gatheringShortId(slugPrefix) ? slugPrefix : param;
}

/** Canonical path for a gathering detail page. */
export function gatheringPath(slug: string): string {
  return `/gatherings/${slug}-${gatheringShortId(slug)}`;
}

/**
 * Query parameter the create-gathering wizard reads to preselect the community
 * a new gathering is filed to (`useGatheringForm`'s `communitySlug`). Kept next
 * to the path helper below so callers never hardcode the name.
 */
export const CREATE_GATHERING_COMMUNITY_PARAM = "community";

/**
 * Deep link into the create-gathering wizard. Pass a `communitySlug` to land
 * with that community already picked in the wizard's community field, which is
 * how a community's Events tab offers "host a gathering here". The wizard still
 * lets the host change or clear it, and the backend re-checks membership on
 * publish.
 */
export function createGatheringPath(communitySlug?: string): string {
  if (!communitySlug) return routes.createGathering;
  const query = new URLSearchParams({
    [CREATE_GATHERING_COMMUNITY_PARAM]: communitySlug,
  });
  return `${routes.createGathering}?${query.toString()}`;
}

/** Query param naming the gathering a new one is being copied from (PRD-190).
 *  Kept beside the path helper below so no caller hardcodes the name. */
export const DUPLICATE_GATHERING_PARAM = "duplicate";

/**
 * "Duplicate gathering": the create wizard, pre-filled from an existing gathering.
 *
 * A host running a monthly one-off used to retype the whole wizard each time.
 * The slug travels in the URL so the prefill survives a refresh and a shared
 * link (router state would lose it), and the wizard fetches the source itself,
 * which also means the copy is subject to the same organiser checks as any
 * other read of that gathering.
 *
 * The date, the time and the two publish confirmations are deliberately NOT
 * copied (see `GatheringFormSeed`).
 */
export function duplicateGatheringPath(slug: string): string {
  const query = new URLSearchParams({ [DUPLICATE_GATHERING_PARAM]: slug });
  return `${routes.createGathering}?${query.toString()}`;
}

/** Lifecycle sub-pages of one gathering (all under `/gatherings/:slug/...`). */
export const gatheringRecapPath = (slug: string): string =>
  `${gatheringPath(slug)}/recap`;
export const gatheringCancelledPath = (slug: string): string =>
  `${gatheringPath(slug)}/cancelled`;

/** The Manage page's tabs, in the order the tab bar shows them. */
export const MANAGE_GATHERING_TABS = [
  "overview",
  "checkin",
  "attendees",
  "messages",
  "settings",
] as const;
export type ManageGatheringTab = (typeof MANAGE_GATHERING_TABS)[number];

/** Query param that opens the Manage page on one of its tabs. */
export const MANAGE_GATHERING_TAB_PARAM = "tab";

/** The Manage tab a `?tab=` value names, or undefined for any other value so
 *  the page opens on its default tab. */
export function manageGatheringTabFromParam(
  value: string | null,
): ManageGatheringTab | undefined {
  return MANAGE_GATHERING_TABS.find((tabId) => tabId === value);
}

/** The Manage page, opened on `tab` when one is given. */
export const manageGatheringPath = (
  slug: string,
  tab?: ManageGatheringTab,
): string => {
  const path = `${gatheringPath(slug)}/manage`;
  if (!tab) return path;
  const query = new URLSearchParams({ [MANAGE_GATHERING_TAB_PARAM]: tab });
  return `${path}?${query.toString()}`;
};
export const gatheringPhotosPath = (slug: string): string =>
  `${gatheringPath(slug)}/photos`;
export const coHostInvitePath = (slug: string, inviteId: string): string =>
  `${gatheringPath(slug)}/co-host-invite/${inviteId}`;

export const lineupInvitePath = (slug: string, entryId: string): string =>
  `${gatheringPath(slug)}/lineup-invite/${entryId}`;

/**
 * The gathering's public link, built off the running instance's origin (see
 * `appOrigin`) so a link copied in dev opens in dev. `gatheringShareUrl` is
 * what gets copied and opened; `gatheringShareDisplayUrl` is the scheme-less
 * form for a URL field, matching the invite-link pair.
 */
export const gatheringShareUrl = (slug: string): string =>
  `${appOrigin()}${gatheringPath(slug)}`;
export const gatheringShareDisplayUrl = (slug: string): string =>
  `${appHost()}${gatheringPath(slug)}`;

/** Query param that opens the Check-in tab in focus mode. */
export const CHECKIN_FOCUS_PARAM = "focus";

/** DOM id of the manage page's tab panel, so it can be scrolled to and focused. */
export const MANAGE_TAB_PANEL_ID = "manage-tab-panel";
