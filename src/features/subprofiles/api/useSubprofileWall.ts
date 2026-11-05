import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSubprofileWall } from "./personaWall.api";
import type { SubprofileCardDTO } from "./subprofiles.api";

/** Every public wall query, both modes. A pick or fill-order write
 *  invalidates this prefix. */
export const SUBPROFILE_WALL_QUERY_ROOT = ["subprofiles", "wall"] as const;

/** The public wall's key. The mode rides in it, since a demo/live switch
 *  keeps the query cache. */
export const subprofileWallKey = (isDemoMode: boolean) =>
  ["subprofiles", "wall", { demo: isDemoMode }] as const;

/** A wall read stays fresh for a minute. */
const SUBPROFILE_WALL_STALE_TIME_MS = 60_000;

export interface SubprofileWallResult {
  /** The wall's cards in order, 0 to 9. Empty while loading and after a
   *  failed read, which hides the wall. */
  cards: SubprofileCardDTO[];
  isLoading: boolean;
  /** True while the other mode's cards still show after a demo/live switch. */
  isShowingPreviousResults: boolean;
}

/** One shared empty list, so a loading wall keeps a stable `cards`. */
const NO_CARDS: SubprofileCardDTO[] = [];

/**
 * The People Directory hero's wall of faces: the admin's picks first, then
 * the fill. Live calls `GET /subprofiles/wall`; demo reads the in-memory
 * persona wall store, which the admin page writes to. A failed read stays
 * silent and the wall hides itself.
 */
export function useSubprofileWall(): SubprofileWallResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<SubprofileCardDTO[]>({
    queryKey: subprofileWallKey(demoMode),
    placeholderData: keepPreviousData,
    staleTime: SUBPROFILE_WALL_STALE_TIME_MS,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoPublicPersonaWall } =
          await import("../personaWallDemoStore");
        return demoPublicPersonaWall();
      }
      return (await getSubprofileWall(signal)).items ?? [];
    },
  });
  return {
    cards: query.data ?? NO_CARDS,
    isLoading: query.isLoading,
    isShowingPreviousResults: query.isPlaceholderData,
  };
}
