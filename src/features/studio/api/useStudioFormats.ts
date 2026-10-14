import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioFormats } from "./studio.api";
import { toFormatList } from "./studio.adapters";
import type { StudioFormat } from "./studio.types";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const FORMATS_STALE_MS = 5 * 60_000;

/** Formats with published content, in map order. The chip row stays quiet
 *  on a failure, so no toast. */
export function useStudioFormats(): {
  formats: StudioFormat[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.formats(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : FORMATS_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toFormatList(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioFormats()
            : await getStudioFormats(),
        ),
      ),
  });
  return {
    formats: query.data ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
