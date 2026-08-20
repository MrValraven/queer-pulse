import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import { getBlocks, type BlockDTO } from "../../social/api/social.api";
import { DEMO_BLOCKED_USERS } from "../blockedUsers.data";

/**
 * Same cache entry `SocialProvider` hydrates its own `blocked` slug list from
 * (`["blocks", demoMode]`, `queryFn: () => getBlocks()`) — sharing the key
 * means this pane's fetch dedupes against the app-wide one instead of firing a
 * second `GET /blocks`, and invalidating this key after an unblock (see
 * `BlockedUsersPane`) keeps both in sync.
 */
export function blockedUsersQueryKey(demoMode: boolean) {
  return ["blocks", demoMode] as const;
}

export interface BlockedUsersResult {
  blockedUsers: BlockDTO[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the live fetch failed — the pane says so instead of showing nothing. */
  failed: boolean;
  /** Re-fetch after an unblock, so the list reflects the server, not our guess. */
  refetch: () => void;
}

const EMPTY_BLOCKED_USERS: BlockDTO[] = [];

/**
 * Data source for `BlockedUsersPane`, mirroring `useSessions`'s demo/live
 * split: demo mode returns the page's own `DEMO_BLOCKED_USERS` mock unchanged,
 * live mode calls `GET /blocks` (already used app-wide by `SocialProvider` to
 * hydrate `useSocial().blocked`, just never surfaced as a manageable list).
 *
 * The list is small and unpaginated by design (one row per blocked member),
 * so a single fetch covers it — same simplification `useSessions` makes.
 */
export function useBlockedUsers(): BlockedUsersResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<ItemsPage<BlockDTO>>({
    queryKey: blockedUsersQueryKey(demoMode),
    enabled: !demoMode,
    queryFn: () => getBlocks(),
  });

  if (demoMode) {
    return {
      blockedUsers: DEMO_BLOCKED_USERS,
      loading: false,
      failed: false,
      refetch: () => {},
    };
  }
  return {
    blockedUsers: query.data?.items ?? EMPTY_BLOCKED_USERS,
    loading: query.isPending,
    failed: query.isError,
    refetch: () => void query.refetch(),
  };
}
