import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toPersonaRefView, type StudioPersonaRefView } from "./studio.adapters";
import { getStudioCreditCandidate } from "./studioDiscovery.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const CANDIDATE_STALE_MS = 60_000;

/** The public card behind an exact handle. A 404 is an answer ("No public
 *  persona has that handle"), so it is read once and stays quiet. */
export function useStudioCreditCandidate(handle: string | null): {
  candidate: StudioPersonaRefView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.creditCandidate(demoMode, handle ?? ""),
    enabled: Boolean(handle) && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : CANDIDATE_STALE_MS,
    retry: false,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toPersonaRefView(
          demoMode
            ? (
                await import("./studioDemoCreditReads")
              ).demoStudioCreditCandidate(handle ?? "")
            : await getStudioCreditCandidate(handle ?? ""),
        ),
      ),
  });
  return {
    candidate: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
