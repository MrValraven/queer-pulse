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
import { getJoinRequests } from "./communities.api";
import { joinRequestToModRequest } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { ModRequest } from "../community.model";

/**
 * Pending join requests for a gated community's mod queue. Demo returns the
 * flagship's mock requests synchronously; live calls GET
 * /communities/:slug/join-requests (mod-only) and adapts each to a ModRequest.
 */
export function useJoinRequests(slug: string | undefined): ModRequest[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<ModRequest[]>({
    queryKey: ["join-requests", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: async () =>
      (await getJoinRequests(slug!)).map(joinRequestToModRequest),
  });
  if (demoMode) return getLiving(slug)?.joinRequests ?? [];
  return query.data ?? [];
}
