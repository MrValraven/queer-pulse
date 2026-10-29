import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { toOfferView, type StudioOfferView } from "./studioPurchases.adapters";
import { getStudioOffer } from "./studioPurchases.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** The buy panel's offer for one release or track (contract 3.1). The panel
 *  hides on a failure, so the read raises no toast. Nothing counts offer
 *  reads. */
export function useStudioOffer(
  kind: "release" | "track",
  itemId: string | null,
  options: { isEnabled: boolean },
): { offer: StudioOfferView | null; loadState: StudioLoadState } {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.offer(demoMode, kind, itemId ?? ""),
    enabled: options.isEnabled && itemId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 0,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const dto = demoMode
          ? (await import("./studioDemoPurchases")).demoStudioOffer(
              kind,
              itemId ?? "",
            )
          : await getStudioOffer(kind, itemId ?? "");
        const offer = toOfferView(dto);
        if (!offer)
          throw new Error("The server sent an offer this build cannot read");
        return offer;
      }),
  });
  if (itemId === null)
    return { offer: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    offer: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
