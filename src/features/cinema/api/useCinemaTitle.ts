import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getCinemaTitle } from "./cinema.api";
import { titleToCard, type CinemaTitleCard } from "./cinema.adapters";

export interface CinemaTitleResult {
  title: CinemaTitleCard | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * A single catalog title (GET /cinema/titles/:id) as the watch header
 * view-model. Live-only and gated exactly like `useCinemaTitles`: disabled in
 * demo, when logged out, or without an `id`, so demo never hits the network.
 */
export function useCinemaTitle(id: string | null): CinemaTitleResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  const query = useQuery<CinemaTitleCard | null>({
    queryKey: ["cinema-title", demoMode, id],
    enabled: !demoMode && loggedIn && Boolean(id),
    queryFn: async () => {
      if (demoMode || !id) return null;
      return titleToCard(await getCinemaTitle(id));
    },
  });

  return {
    title: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
