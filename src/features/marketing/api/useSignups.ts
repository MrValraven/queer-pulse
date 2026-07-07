import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSignups } from "./volunteering.api";
import { signupToRow, type SignupRow } from "./volunteering.adapters";

/**
 * Poster-only signup roster (GET /volunteering/:slug/signups). Only enabled when
 * the viewer is the poster. Demo mode has no roster to show (the prototype never
 * exposed one), so it returns an empty list with zero network; live mode fetches
 * and adapts each signup to a render-ready row.
 */
export function useSignups(slug: string | undefined, isPoster: boolean) {
  const { demoMode } = useDemoMode();
  return useQuery<SignupRow[]>({
    queryKey: ["opportunity-signups", demoMode, slug],
    enabled: Boolean(slug) && isPoster && !demoMode,
    queryFn: async () => {
      if (demoMode || !slug) return [];
      const rows = await getSignups(slug);
      return rows.map(signupToRow);
    },
  });
}
