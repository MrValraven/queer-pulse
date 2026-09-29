import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { demoCard } from "../goTogether.mock";
import { getGoTogetherCard } from "./goTogether.api";
import type { GoTogetherCardDTO } from "./goTogether.types";
import { goTogetherKeys } from "./goTogetherKeys";

/**
 * The Go together card on a gathering page, `GET /events/:slug/go-together`.
 * Demo mode reads the demo registry; live mode waits for a settled, active
 * session, the same gate `useEventLineup` uses, so a visitor never hits it.
 */
export function useGoTogetherCard(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const isActiveSession = !checking && loggedIn && status === "active";
  return useQuery<GoTogetherCardDTO>({
    queryKey: goTogetherKeys.card(slug, demoMode),
    enabled: Boolean(slug) && (demoMode || isActiveSession),
    retry: false,
    queryFn: async () =>
      demoMode || !slug ? demoCard(slug ?? "") : getGoTogetherCard(slug),
  });
}
