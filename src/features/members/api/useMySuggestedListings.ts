import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import type { ItemsPage } from "../../../shared/api/pagination";
import {
  getMySuggestedListings,
  type MySuggestedListingDTO,
} from "./mySuggestedListings.api";

/**
 * PRD-434. The places this member suggested for the directory, newest first,
 * a page at a time.
 *
 * The key sits under the `["listings"]` prefix on purpose: submitting a
 * listing through the wizard invalidates that prefix, so a suggestion sent a
 * moment ago is here the next time the section mounts.
 *
 * Demo mode never touches the network: the colocated fixture is pulled in by
 * dynamic import, so it never runs on the live path and never ships in the
 * live chunk. Live mode waits for a signed-in session, because the endpoint
 * sits behind `ActiveMemberGuard`.
 */
export function useMySuggestedListings({ isEnabled }: { isEnabled: boolean }) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  const query = useInfiniteQuery<ItemsPage<MySuggestedListingDTO>>({
    queryKey: ["listings", "suggestions", "mine", demoMode],
    enabled: isEnabled && (demoMode || loggedIn),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { DEMO_MY_SUGGESTED_LISTINGS } =
          await import("../mySuggestedListings.data");
        return {
          items: DEMO_MY_SUGGESTED_LISTINGS,
          total: DEMO_MY_SUGGESTED_LISTINGS.length,
          page: 1,
          pageSize: DEMO_MY_SUGGESTED_LISTINGS.length || 1,
        };
      }
      return getMySuggestedListings(pageParam as number);
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });

  const suggestions: MySuggestedListingDTO[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];
  return { ...query, suggestions };
}
