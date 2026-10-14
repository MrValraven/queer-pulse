import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toAppearsOnCardView,
  type StudioAppearsOnCardView,
} from "./studioDiscovery.adapters";
import { getStudioAppearsOn } from "./studioDiscovery.api";
import type { StudioLoadState } from "./studioLoadState";
import { studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import { useStudioCursorPages } from "./useStudioCursorPages";

export interface StudioAppearsOnResult {
  cards: StudioAppearsOnCardView[];
  loadState: StudioLoadState;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

/** Releases where this persona holds an accepted credit, with the roles.
 *  The artist page hides the section on a failure, so no toast. */
export function useStudioAppearsOn(
  subprofileId: string | null,
): StudioAppearsOnResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const { items, ...pager } = useStudioCursorPages({
    queryKey: studioKeys.appearsOn(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    silentError: true,
    read: async (cursor) =>
      demoMode
        ? (await import("./studioDemoDiscovery")).demoStudioAppearsOn(
            subprofileId ?? "",
            cursor,
          )
        : await getStudioAppearsOn(subprofileId ?? "", cursor),
    toView: toAppearsOnCardView,
  });
  return { cards: items, ...pager };
}
