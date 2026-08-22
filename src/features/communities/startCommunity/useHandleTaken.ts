import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "../../../shared/hooks";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { getCommunity } from "../api/communities.api";

/**
 * Best-effort "is this address already someone else's?" check for the wizard's
 * handle field, so a founder finds out on chapter 8 rather than after the
 * submit that ends the whole flow in a generic failure.
 *
 * Deliberately one-sided. A 200 from `GET /communities/:handle` is proof the
 * handle is taken and we say so. Anything else is NOT proof it's free: that
 * endpoint 404s a private community to a non-member, so an "available" claim
 * would be a promise this check cannot keep. Silence there, and the real
 * answer stays with the server's 409 on create (mapped to the same inline
 * field error by `StartCommunityPage`).
 *
 * Demo mode has no directory to ask, so it never probes.
 */
export function useHandleTaken(handle: string): boolean {
  const { demoMode } = useDemoMode();
  // Only ask once they stop typing — the wizard slugifies on every keystroke.
  const debouncedHandle = useDebouncedValue(handle.trim(), 500);
  const query = useQuery({
    queryKey: ["community-handle-taken", debouncedHandle],
    enabled: !demoMode && debouncedHandle.length > 1,
    // A taken handle stays taken; no reason to re-ask while the founder edits
    // around it.
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      try {
        await getCommunity(debouncedHandle);
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return false;
        // A 401/403/500 tells us nothing about the handle. Say nothing.
        return false;
      }
    },
  });
  return query.data === true;
}
