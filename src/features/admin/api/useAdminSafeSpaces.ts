import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_SAFE_SPACE_CANDIDATES } from "../adminSafeSpaces.data";
import { getSafeSpaceCandidates, type SafeSpaceCandidate } from "./adminSafeSpaces.api";

/** Shared with `useSetSafeSpace`, which invalidates this key on a successful toggle. */
export const ADMIN_SAFE_SPACE_CANDIDATES_KEY = "admin-safe-space-candidates";

/**
 * The moderator's Safe Space candidates queue — every listing eligible to
 * become, or already carrying, a Safe Space status. Demo mode returns the
 * colocated `ADMIN_SAFE_SPACE_CANDIDATES` fixture and never hits the network —
 * this is a Moderator/Admin-only endpoint that 403s for anyone else, and the
 * fixture is fabricated data that must not appear as platform truth unless the
 * operator explicitly turned "Populate platform" on.
 */
export function useAdminSafeSpaces() {
  const { demoMode } = useDemoMode();
  const query = useQuery<SafeSpaceCandidate[]>({
    queryKey: [ADMIN_SAFE_SPACE_CANDIDATES_KEY, demoMode],
    initialData: demoMode ? ADMIN_SAFE_SPACE_CANDIDATES : undefined,
    queryFn: async () => {
      if (demoMode) return ADMIN_SAFE_SPACE_CANDIDATES;
      return getSafeSpaceCandidates();
    },
  });
  return { ...query, candidates: query.data ?? [] };
}
