/**
 * The invitations shelf's route (PRD-140).
 *
 * A one-line module of its own, the same shape as `communityPostPath.ts`, for
 * one reason: `routes.tsx` must be able to name the path WITHOUT importing the
 * page, or the lazy chunk it registers would be pulled into the boot bundle by
 * the very import that describes it. `routeMap.ts` is shared with every other
 * feature, so the literal lives here rather than there.
 */
export const COMMUNITY_INVITATIONS_PATH = "/communities/invitations";
