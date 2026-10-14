import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toPersonaCreditOwnerRows,
  type StudioPersonaCreditOwnerRowView,
} from "./studioDiscovery.adapters";
import { getStudioTrackPersonaCredits } from "./studioDiscovery.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const OWNER_ROWS_STALE_MS = 30_000;

/** The track editor's persona credits with their statuses, oldest first.
 *  Writes patch this cache (useStudioPersonaCreditMutations). */
export function useStudioTrackPersonaCredits(trackId: string | null): {
  rows: StudioPersonaCreditOwnerRowView[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.personaCredits(demoMode, trackId ?? ""),
    enabled: trackId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : OWNER_ROWS_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const dto = demoMode
          ? (
              await import("./studioDemoCreditReads")
            ).demoStudioTrackPersonaCredits(trackId ?? "")
          : await getStudioTrackPersonaCredits(trackId ?? "");
        return toPersonaCreditOwnerRows(dto.items);
      }),
  });
  return {
    rows: query.data ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
