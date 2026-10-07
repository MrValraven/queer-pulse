import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { DirectoryPlace } from "../directoryPlaces";
import { ADULT_ONLINE_DIRECTORY_PLACES } from "../directoryOnlinePlaces.data";
import { cardDtoToPlace } from "./directory.adapters";
import { getAdultDirectory } from "./directory.api";
import { DIRECTORY_KEY } from "./directoryQueryKey";

/** Returned while the list is off, loading or failed: one shared array, so a
 *  caller's memo over `places` stays stable from render to render. */
const NO_ADULT_PLACES: DirectoryPlace[] = [];

export interface AdultDirectoryPlacesResult {
  places: DirectoryPlace[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * The 18+ listings for the Online tab's "Show 18+ shops" chip. Live, it reads
 * the member-only `GET /directory/adult` (uncached, so it never lands in the
 * CDN copy every visitor gets); demo, the one 18+ fixture, searched locally.
 * Off (`isEnabled` false) it reads nothing and returns no places: the caller
 * enables it only for a signed-in member with the chip on, and the hook also
 * stays off for a signed-out viewer whoever calls it.
 *
 * Its own failures stay quiet (`silentError`): the tab keeps every other
 * listing and says in place that the 18+ shops did not load.
 */
export function useAdultDirectoryPlaces({
  query,
  isEnabled,
}: {
  query: string;
  isEnabled: boolean;
}): AdultDirectoryPlacesResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const isActive = isEnabled && loggedIn;
  const trimmedQuery = query.trim();
  const result = useQuery<DirectoryPlace[]>({
    queryKey: [DIRECTORY_KEY, "adult", demoMode, trimmedQuery],
    enabled: isActive,
    meta: { silentError: true },
    queryFn: async () => {
      if (demoMode) {
        const needle = trimmedQuery.toLowerCase();
        return ADULT_ONLINE_DIRECTORY_PLACES.filter((place) =>
          `${place.name} ${place.desc}`.toLowerCase().includes(needle),
        );
      }
      const cards = await getAdultDirectory({ q: trimmedQuery || undefined });
      return cards.map(cardDtoToPlace);
    },
  });
  return {
    places: isActive ? (result.data ?? NO_ADULT_PLACES) : NO_ADULT_PLACES,
    isLoading: isActive && result.isLoading,
    isError: isActive && result.isError,
    refetch: () => void result.refetch(),
  };
}
