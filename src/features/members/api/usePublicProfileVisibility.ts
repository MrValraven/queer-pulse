import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  getPublicProfileVisibility,
  type PublicProfileVisibilityDTO,
} from "./publicProfile.api";

export interface PublicProfileVisibilityResult {
  /** The stored preference, once it arrives. `undefined` in demo mode and while
   *  signed out — there is nothing stored to read. */
  data: PublicProfileVisibilityDTO | undefined;
}

/**
 * The member's stored public-profile preference.
 *
 * Lifted out of `PublicProfileProvider` so the request fires when a page that
 * shows the control mounts, rather than on every route. Note that only the
 * *fetch* moved: `eligibility` is still derived inside the provider from
 * `useProfile()`, so the provider still has to sit inside `ProfileProvider`.
 *
 * The key is unchanged (`["publicProfileVisibility", demoMode]`): the provider's
 * `setEnabled` writes the confirmed response into this entry with
 * `setQueryData`, so renaming it would silently break write-through.
 */
export function usePublicProfileVisibility(): PublicProfileVisibilityResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  // `loggedIn` is false while the session is still being determined, so this
  // also parks the fetch until GET /auth/me resolves rather than racing it.
  const live = !demoMode && loggedIn;

  const query = useQuery<PublicProfileVisibilityDTO>({
    queryKey: ["publicProfileVisibility", demoMode],
    enabled: live,
    queryFn: getPublicProfileVisibility,
  });

  return { data: query.data };
}
