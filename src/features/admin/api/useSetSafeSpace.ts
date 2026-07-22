import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import { ADMIN_SAFE_SPACE_CANDIDATES } from "../adminSafeSpaces.data";
import { setSafeSpace, type SafeSpaceCandidate, type SetSafeSpaceInput } from "./adminSafeSpaces.api";
import { ADMIN_SAFE_SPACE_CANDIDATES_KEY } from "./useAdminSafeSpaces";

/** How long the demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 500;

export interface SetSafeSpaceVars {
  ref: string;
  body: SetSafeSpaceInput;
}

/** The stand-in row demo mode edits when a ref isn't in the mock queue. */
function demoCandidate(ref: string): SafeSpaceCandidate {
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
 * Both modes resolve with a `SafeSpaceCandidate` — the row shape the
 * candidates queue actually renders — rather than the full `ListingDTO` the
 * backend returns, so callers can update a row without depending on unrelated
 * listing fields (photos, hours, owner details, …) that this feature never
 * touches. On success the candidates query is invalidated so the queue
 * refetches (a no-op in demo mode, whose data never changes underneath it).
 */
export function useSetSafeSpace() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<SafeSpaceCandidate, Error, SetSafeSpaceVars>({
    mutationFn: async ({ ref, body }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.safeSpace.set (demo — no network)", {
          ref,
          status: body.status,
        });
        return { ...demoCandidate(ref), safeSpaceStatus: body.status };
      }
      const updatedListing = await setSafeSpace(ref, body);
      return {
        ref: updatedListing.ref,
        slug: updatedListing.slug,
        name: updatedListing.name,
        hood: updatedListing.hood,
        safeSpaceStatus: body.status,
      };
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_CANDIDATES_KEY],
      });
    },
  });
}
