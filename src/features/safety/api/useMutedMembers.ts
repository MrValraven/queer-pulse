import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import { getMutes, type MuteDTO } from "../../social/api/social.api";
import { DEMO_MUTED_MEMBERS } from "../mutedMembers.data";

/**
 * Same cache entry `SocialProvider` hydrates its own `muted` slug list from
 * (`["mutes", demoMode]`, `queryFn: () => getMutes()`), exactly as
 * `useBlockedUsers` shares `["blocks", demoMode]`. Sharing the key means the
 * pane's fetch dedupes against the app-wide one instead of firing a second
 * `GET /mutes`, and invalidating this key after an unmute re-hydrates
 * `useSocial().muted` too, so every surface that hides a muted member agrees
 * with the list.
 */
export function mutedMembersQueryKey(demoMode: boolean) {
  return ["mutes", demoMode] as const;
}

export interface MutedMembersResult {
  mutedMembers: MuteDTO[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /**
   * True when the live fetch failed. The pane says so instead of rendering the
   * empty state: an outage must never tell a member they have muted nobody,
   * because that is exactly the moment they would go and mute the person again.
   */
  failed: boolean;
  /** Re-fetch after an unmute, so the list reflects the server, not our guess. */
  refetch: () => void;
}

const EMPTY_MUTED_MEMBERS: MuteDTO[] = [];

/**
 * Data source for the "Muted" section of `BlockedUsersPane`, mirroring
 * `useBlockedUsers`'s demo/live split: demo mode returns `DEMO_MUTED_MEMBERS`
 * unchanged, live mode calls `GET /mutes` (already used app-wide by
 * `SocialProvider` to hydrate `useSocial().muted`, just never surfaced as a
 * manageable list until now).
 *
 * The list is small and unpaginated by design (one row per muted member), so a
 * single fetch covers it, the same simplification `useBlockedUsers` makes.
 */
export function useMutedMembers(): MutedMembersResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<ItemsPage<MuteDTO>>({
    queryKey: mutedMembersQueryKey(demoMode),
    enabled: !demoMode,
    queryFn: () => getMutes(),
  });

  if (demoMode) {
    return {
      mutedMembers: DEMO_MUTED_MEMBERS,
      loading: false,
      failed: false,
      refetch: () => {},
    };
  }
  return {
    mutedMembers: query.data?.items ?? EMPTY_MUTED_MEMBERS,
    loading: query.isPending,
    failed: query.isError,
    refetch: () => void query.refetch(),
  };
}
