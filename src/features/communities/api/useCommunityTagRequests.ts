import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCommunityTagRequests,
  type CommunityTagRequestsResponseDTO,
} from "./communityTagRequests.api";

/**
 * The exact key one community's tag-suggestion log caches under.
 *
 * `demoMode` is part of the key because the toggle flips at runtime: the empty
 * log demo answers with must never survive a switch to live and be read back
 * as a real community's history.
 */
export function communityTagRequestsQueryKey(
  slug: string | undefined,
  demoMode: boolean,
) {
  return [...communityTagRequestsPrefix(slug), demoMode] as const;
}

/** One community's whole cached log, for anything that files a new suggestion
 *  to invalidate. Slug sits ahead of `demoMode` so this stays a usable prefix,
 *  the same ordering the governance log uses. */
export function communityTagRequestsPrefix(slug: string | undefined) {
  return ["community-tag-requests", slug] as const;
}

/**
 * This community's own tag suggestions, newest first (PRD-150).
 *
 * Suggesting a tag used to be fire and forget: an owner sent "polyamory" into
 * the platform and had nothing to look at afterwards, no way to tell whether
 * anybody had read it, and no way to tell their own suggestion from a
 * co-moderator's. This is the read half.
 *
 * `isEnabled` is how the caller passes the staff gate in. The endpoint is
 * owner/co-owner/moderator only and 403s everybody else, so the call is only
 * ever made for a viewer whose roster role (`myRole` on the community DTO,
 * never `isMember()`) already says they are staff here.
 *
 * The demo registry holds no tag requests at all, so demo mode answers with an
 * empty log without touching the network. That renders the log's real empty
 * state, which is the honest demo outcome rather than an invented suggestion,
 * and matches how `useCommunityGovernanceLog` and `useCommunityBans` treat the
 * prototype.
 *
 * The raw query is returned rather than a flattened `{ items, isLoading }`
 * shape, deliberately: an owner has to be able to tell a failed request apart
 * from a community that has genuinely never suggested anything. Collapsing
 * `isError` into an empty list is how a log lies.
 */
export function useCommunityTagRequests(
  slug: string | undefined,
  isEnabled = true,
) {
  const { demoMode } = useDemoMode();
  return useQuery<CommunityTagRequestsResponseDTO>({
    queryKey: communityTagRequestsQueryKey(slug, demoMode),
    enabled: isEnabled && Boolean(slug),
    queryFn: () =>
      demoMode
        ? Promise.resolve({ items: [] })
        : getCommunityTagRequests(slug!),
  });
}
