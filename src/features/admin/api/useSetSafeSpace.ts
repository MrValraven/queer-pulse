import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_SAFE_SPACE_CANDIDATES } from "../adminSafeSpaces.data";
import {
  setSafeSpace,
  type SafeSpaceCandidate,
  type SetSafeSpaceInput,
} from "./adminSafeSpaces.api";
import { ADMIN_SAFE_SPACE_CANDIDATES_KEY } from "./useAdminSafeSpaces";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** How long the demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 500;

export interface SetSafeSpaceVars {
  ref: string;
  body: SetSafeSpaceInput;
}

/**
 * What a save resolves with: the candidate row MINUS its visit tally.
 *
 * `PATCH /listings/:ref/safe-space` answers with a `ListingDTO`, which carries
 * no independent-visit count, and the tally is only recomputed when the
 * candidates queue is refetched. Returning the row without it keeps this
 * honest: a caller that needs the count reads it off the refetched queue rather
 * than off a number this mutation would have had to invent.
 */
export type SafeSpaceSaveResult = Omit<SafeSpaceCandidate, "visits">;

/** The stand-in row demo mode edits when a ref isn't in the mock queue. */
function demoCandidate(ref: string): SafeSpaceSaveResult {
  const found = ADMIN_SAFE_SPACE_CANDIDATES.find(
    (candidate) => candidate.ref === ref,
  );
  if (found) return found;
  return { ref, slug: ref, name: ref, hood: "", safeSpaceStatus: "none" };
}

/**
 * A moderator verifies, removes, or reinstates a listing's Safe Space status
 * (spec Task 9, on top of the Task 4 backend). Demo mode resolves after a
 * short simulated delay and never touches the network — this is a
 * Moderator/Admin-only endpoint, and the fixture must not appear to mutate
 * platform truth unless the operator explicitly turned "Populate platform"
 * on. Live mode PATCHes `/listings/:ref/safe-space`.
 *
 * Both modes resolve with a `SafeSpaceSaveResult` — the row shape the
 * candidates queue actually renders, minus the visit tally — rather than the
 * full `ListingDTO` the backend returns, so callers can update a row without
 * depending on unrelated listing fields (photos, hours, owner details, …) that
 * this feature never touches. On success the candidates query is invalidated so
 * the queue refetches (a no-op in demo mode, whose data never changes
 * underneath it), which is also what brings a fresh tally back.
 *
 * A save that moves a listing INTO `verified` below the independent-visit bar
 * is REFUSED by the backend unless `body.belowVisitBarReason` comes with it
 * (400, `code: "SAFE_SPACE_VISIT_BAR_NOT_MET"`). Callers read that code through
 * `classifyVisitBarRefusal`; this hook stays out of it so both the row control
 * and the editor can answer it in their own way.
 */
export function useSetSafeSpace() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<SafeSpaceSaveResult, Error, SetSafeSpaceVars>({
    demoMode,
    demoLatencyMs: DEMO_LATENCY_MS,
    logLabel: "admin.safeSpace.set",
    logContext: ({ ref, body }) => ({ ref, status: body.status }),
    demoResult: ({ ref, body }) => ({
      ...demoCandidate(ref),
      safeSpaceStatus: body.status,
    }),
    live: async ({ ref, body }) => {
      const updatedListing = await setSafeSpace(ref, body);
      return {
        ref: updatedListing.ref,
        slug: updatedListing.slug,
        name: updatedListing.name,
        hood: updatedListing.hood,
        safeSpaceStatus: body.status,
      };
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_CANDIDATES_KEY],
      });
    },
  });
}
