import type { EventGuestCommunityView } from "./api/eventCommunities.api";

/**
 * Demo-mode fallback for `useEventGuestCommunities`, keyed by gathering
 * slug. `pride-brunch-jun` is the slug the demo Manage page opens on
 * (`DEMO_GATHERING_SLUGS.manage`), so its edit modal shows a row in each
 * status. `queer-runners-run` matches the accepted guest on its detail mock
 * in `data.ts`.
 */
const DEMO_EVENT_GUEST_COMMUNITIES: Record<string, EventGuestCommunityView[]> =
  {
    "pride-brunch-jun": [
      {
        id: "demo-collab-trans-hub",
        status: "accepted",
        community: {
          slug: "trans-hub",
          name: "Trans & Non-Binary Hub",
          accessTier: "public",
        },
      },
      {
        id: "demo-collab-rainbow-arts",
        status: "pending",
        community: {
          slug: "rainbow-arts",
          name: "Rainbow Arts Collective",
          accessTier: "request",
        },
      },
      {
        id: "demo-collab-queer-elders",
        status: "declined",
        community: {
          slug: "queer-elders",
          name: "Queer Elders",
          accessTier: "public",
        },
      },
    ],
    "queer-runners-run": [
      {
        id: "demo-collab-trans-hub-run",
        status: "accepted",
        community: {
          slug: "trans-hub",
          name: "Trans & Non-Binary Hub",
          accessTier: "public",
        },
      },
    ],
  };

/** A fresh copy, so a demo save that patches the cache never edits the
 *  fixture itself. */
export function demoGuestCommunitiesFor(
  slug: string,
): EventGuestCommunityView[] {
  return (DEMO_EVENT_GUEST_COMMUNITIES[slug] ?? []).map((view) => ({
    ...view,
    community: { ...view.community },
  }));
}
