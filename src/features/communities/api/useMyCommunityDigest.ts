import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getMyCommunityDigest,
  type CommunityDigestEntryDTO,
} from "./myCommunityDigest.api";

export interface MyCommunityDigestResult {
  /** Ordered loudest week first, then alphabetically, by the backend. */
  communities: CommunityDigestEntryDTO[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const NOOP = () => {};
/** Stable empty list so a consumer never sees a new array identity per render. */
const EMPTY: CommunityDigestEntryDTO[] = [];

/**
 * The viewer's week across all of their communities at once
 * (`GET /me/communities/digest`).
 *
 * ONE request, whatever the member's community count: this is the hook to reach
 * for on any cross-community surface, and mapping the membership list to a
 * per-community hook is the thing it exists to prevent.
 *
 * Live-only. Demo mode short-circuits to an empty result and never touches the
 * network, because the prototype's cross-community activity lives in the
 * `getLiving` mock registry instead. The `/communities` route is auth-gated
 * (see `authGate.ts`), so `!demoMode` is the whole gate here, matching
 * `useMyCommunities`. `options.enabled` is for a caller that mounts the hook
 * before it knows it needs the data.
 *
 * No `staleTime`/`gcTime` override: the app-wide 30s default is right for a
 * seven-day window, which cannot move meaningfully inside one visit.
 */
export function useMyCommunityDigest(
  options: { enabled?: boolean } = {},
): MyCommunityDigestResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();

  const query = useQuery({
    queryKey: ["my-community-digest"],
    enabled: !demoMode && enabled,
    queryFn: getMyCommunityDigest,
    // The hub renders its own `LoadErrorState` with a retry, so the global
    // toast would be a second copy of the same news.
    meta: { silentError: true },
  });

  if (demoMode) {
    return {
      communities: EMPTY,
      isLoading: false,
      isError: false,
      refetch: NOOP,
    };
  }
  return {
    communities: query.data?.communities ?? EMPTY,
    isLoading: enabled && query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
