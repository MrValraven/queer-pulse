import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { pageOf } from "./studioFlagReview.adapters";
import { studioKeys } from "./studioQueryKeys";
import {
  toAdminClaimView,
  type StudioAdminClaimView,
} from "./studioSafety.adapters";
import {
  decideStudioClaim,
  getAdminStudioClaimCounts,
  getAdminStudioClaims,
  type StudioClaimDecision,
} from "./studioSafety.api";
import { studioSafetyKeys } from "./studioSafetyQueryKeys";
import {
  removeFromList,
  useReviewList,
  type StudioReviewList,
} from "./useStudioFlagReview";

/** The panels own every failure state; nothing here toasts. */
const SILENT = { silentError: true } as const;
const loadDemo = () => import("./studioDemoSafety");

/** The work queue: submitted and countered claims, oldest first. */
export function useStudioReviewClaims(): StudioReviewList<StudioAdminClaimView> {
  const { demoMode } = useDemoMode();
  return useReviewList(
    studioSafetyKeys.reviewClaims(demoMode),
    async (cursor) => {
      const page = demoMode
        ? (await loadDemo()).demoAdminClaimsPage(null)
        : await getAdminStudioClaims(null, cursor);
      return pageOf(page.items.map(toAdminClaimView), page.pageInfo);
    },
  );
}

/** Accepted claims: the track is offline and the claim waits for the
 *  artist, and staff can still uphold or reject it without a counter-notice.
 *  Its key sits under the work queue's, so every queue refresh reads it
 *  again too. */
export const acceptedClaimsKey = (demoMode: boolean) =>
  [...studioSafetyKeys.reviewClaims(demoMode), "accepted"] as const;

export function useStudioAcceptedClaims(): StudioReviewList<StudioAdminClaimView> {
  const { demoMode } = useDemoMode();
  return useReviewList(acceptedClaimsKey(demoMode), async (cursor) => {
    const page = demoMode
      ? (await loadDemo()).demoAdminClaimsPage("accepted")
      : await getAdminStudioClaims("accepted", cursor);
    return pageOf(page.items.map(toAdminClaimView), page.pageInfo);
  });
}

/** The Claims tab badge: claims waiting for our team (submitted plus
 *  countered), read from the counts route so the badge never pages the
 *  queue. */
export function useStudioClaimCounts(): { waitingCount: number } {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: studioSafetyKeys.reviewClaimCounts(demoMode),
    meta: SILENT,
    queryFn: async () =>
      demoMode
        ? (await loadDemo()).demoAdminClaimCounts()
        : getAdminStudioClaimCounts(),
  });
  const counts = query.data;
  return { waitingCount: counts ? counts.submitted + counts.countered : 0 };
}

/** A decision moves a track in or out of withheld, so the pages that show
 *  it read again: live, every release and track; demo, the claim's own
 *  (a broad demo re-read would drop the session's other edits). */
function refreshAfterDecision(
  queryClient: QueryClient,
  demoMode: boolean,
  claim: StudioAdminClaimView | null,
): void {
  void queryClient.invalidateQueries({
    queryKey: studioSafetyKeys.reviewClaims(demoMode),
  });
  void queryClient.invalidateQueries({
    queryKey: studioSafetyKeys.reviewClaimCounts(demoMode),
  });
  if (!demoMode) {
    void queryClient.invalidateQueries({ queryKey: ["studio", "release"] });
    void queryClient.invalidateQueries({ queryKey: ["studio", "track"] });
    return;
  }
  if (!claim) return;
  void queryClient.invalidateQueries({
    queryKey: studioKeys.release(true, claim.release.id),
  });
  void queryClient.invalidateQueries({
    queryKey: studioKeys.track(true, claim.track.id),
  });
}

/** Accept, decline, uphold or reject. Every decision moves the card out of
 *  the list it sat in (an accepted claim reappears under "waiting for the
 *  artist" once the lists read again, the rest are closed); a refusal
 *  re-reads both lists, since the card moved on. */
export function useStudioClaimDecision() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioAdminClaimView,
    Error,
    { claimId: string; decision: StudioClaimDecision; note: string | null }
  >({
    meta: SILENT,
    mutationFn: async ({ claimId, decision, note }) =>
      toAdminClaimView(
        demoMode
          ? (await loadDemo()).demoDecideClaim(claimId, decision, note)
          : await decideStudioClaim(claimId, decision, note),
      ),
    onSuccess: (claim) => {
      const isDecided = (item: StudioAdminClaimView) => item.id === claim.id;
      removeFromList(
        queryClient,
        studioSafetyKeys.reviewClaims(demoMode),
        isDecided,
      );
      removeFromList(queryClient, acceptedClaimsKey(demoMode), isDecided);
      refreshAfterDecision(queryClient, demoMode, claim);
    },
    onError: () => refreshAfterDecision(queryClient, demoMode, null),
  });
}
