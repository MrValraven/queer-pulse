import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useStudioMyClaims } from "./useStudioClaims";

/** Claims the member filed that wait for their reply (countered and still unanswered). */
export function useStudioMyClaimsReplyCount(): { count: number } {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const list = useStudioMyClaims({
    isEnabled: demoMode || loggedIn,
    silentError: true,
  });
  return { count: list.items.filter((claim) => claim.canReply).length };
}
