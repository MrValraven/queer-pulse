import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getCinemaTitles } from "./cinema.api";
import { titleToCard, type CinemaTitleCard } from "./cinema.adapters";

export interface CinemaTitlesResult {
  titles: CinemaTitleCard[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * The live cinema catalog (GET /cinema/titles) as browse cards.
 *
 * Live-only by design: titles require an active member session, and the demo
 * browse experience renders its own rich mock catalogue (with filters/sort the
 * DTO can't feed) unchanged. So the query is gated on `!demoMode && loggedIn`
 * and short-circuits to an empty list in demo — it never touches the network in
 * demo mode. `demoMode` is part of the key so the two modes never share a cache.
 */
export function useCinemaTitles(): CinemaTitlesResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  const query = useQuery<CinemaTitleCard[]>({
    queryKey: ["cinema-titles", demoMode],
    enabled: !demoMode && loggedIn,
    queryFn: async () => {
      if (demoMode) return [];
      const rows = await getCinemaTitles();
      return rows.map(titleToCard);
    },
  });

  return {
    titles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
