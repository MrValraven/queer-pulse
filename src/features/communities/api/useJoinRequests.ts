/**
 * COMMUNITY-LEVEL join requests: existing members asking to join one gated
 * community (that community's mod queue). Do not confuse this hook with
 * `src/features/admin/api/useJoinRequests.ts`, which lists PLATFORM-LEVEL
 * join requests, strangers with no account asking to join QueerPulse itself.
 * Same name, same vocabulary (approve/decline), unrelated data: this one
 * reads `GET /communities/:slug/join-requests`, the other `GET
 * /join-requests`.
 */
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getJoinRequests } from "./communities.api";
import { joinRequestToModRequest } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { ModRequest } from "../community.model";

export interface JoinRequestsResult {
  items: ModRequest[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Pending join requests for a gated community's mod queue. Demo returns the
 * flagship's mock requests synchronously; live calls GET
 * /communities/:slug/join-requests (mod-only) and adapts each to a ModRequest.
 *
 * The failure signal is part of the result on purpose. This endpoint can 403
 * (the documented community-mod vs. platform-moderator gap, see
 * `communities.api.ts`), and swallowing that into `[]` painted the "No pending
 * requests" empty state — which a moderator reads as "all clear" when in fact
 * the queue was never loaded.
 */
export function useJoinRequests(slug: string | undefined): JoinRequestsResult {
  const { demoMode } = useDemoMode();
  // Live rows resolve a nulled-out member ref to a translated placeholder, so
  // the mapping runs outside `queryFn` and follows a language switch directly.
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["join-requests", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getJoinRequests(slug!),
  });
  const refetch = () => void query.refetch();
  if (demoMode) {
    return {
      items: getLiving(slug)?.joinRequests ?? [],
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }
  return {
    items: (query.data ?? []).map((dto) => joinRequestToModRequest(dto, t)),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch,
  };
}
