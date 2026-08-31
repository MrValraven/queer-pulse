import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCommunityGovernanceLog,
  type CommunityGovernanceLogAction,
  type CommunityGovernanceLogPageDTO,
} from "./communityGovernanceLog.api";

/** Mirrors the backend's `PAGE_SIZE` (`src/common/pagination.ts`), which this
 *  endpoint paginates by and does not accept as a query param. The response
 *  echoes `pageSize` back, so the pane prefers that and only falls back here. */
export const COMMUNITY_GOVERNANCE_LOG_PAGE_SIZE = 20;

/**
 * The exact key one page of this community's governance trail caches under.
 *
 * `demoMode` is part of the key because the toggle flips at runtime: nothing
 * synthesized in demo may survive a switch to live and be read back as real
 * governance history.
 */
export function communityGovernanceLogQueryKey(
  slug: string | undefined,
  demoMode: boolean,
  page: number,
  action: CommunityGovernanceLogAction | undefined,
) {
  return [
    ...communityGovernanceLogPrefix(slug),
    demoMode,
    page,
    action ?? "all",
  ] as const;
}

/** Every cached page of one community's trail, for anything that writes a new
 *  entry to invalidate. Slug sits ahead of `demoMode` so this stays a usable
 *  prefix, the same ordering the admin twin uses. */
export function communityGovernanceLogPrefix(slug: string | undefined) {
  return ["community-governance-log", slug] as const;
}

/**
 * One page of this community's governance audit trail, newest first
 * (`GET /communities/:slug/governance-log`).
 *
 * The demo mock carries no governance rows, so demo mode answers with an empty
 * page without touching the network. That renders the pane's real empty state,
 * which is the honest demo outcome rather than an invented removal.
 *
 * The raw query is returned rather than a flattened `{ items, isLoading }`
 * shape, and deliberately so: a moderator has to be able to tell a failed or
 * forbidden request apart from a community that has genuinely never been
 * moderated. Collapsing `isError` into an empty list is how an audit trail
 * lies.
 */
export function useCommunityGovernanceLog(
  slug: string | undefined,
  page: number,
  action: CommunityGovernanceLogAction | undefined,
  isEnabled = true,
) {
  const { demoMode } = useDemoMode();
  return useQuery<CommunityGovernanceLogPageDTO>({
    queryKey: communityGovernanceLogQueryKey(slug, demoMode, page, action),
    enabled: isEnabled && Boolean(slug),
    queryFn: () =>
      demoMode
        ? Promise.resolve({
            items: [],
            total: 0,
            page,
            pageSize: COMMUNITY_GOVERNANCE_LOG_PAGE_SIZE,
          })
        : getCommunityGovernanceLog(slug!, { page, action }),
  });
}
