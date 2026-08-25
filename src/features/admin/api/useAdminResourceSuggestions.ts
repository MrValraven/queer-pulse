import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminResourceSuggestions,
  type AdminResourceSuggestionDTO,
  type ResourceListingCategory,
} from "./adminResourceSuggestions.api";

export type AdminResourceSuggestionCategoryFilter =
  ResourceListingCategory | "all";

interface AdminResourceSuggestionsPageVM {
  items: AdminResourceSuggestionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide resource-suggestion list for the admin review queue,
 * paginated and optionally filtered by category. Demo mode returns the
 * colocated fixture (filtered client-side) as a single synthetic page and
 * never hits the network. Live mode calls
 * `GET /admin/resource-suggestions?page&category`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminResourceSuggestions(
  filter: AdminResourceSuggestionCategoryFilter,
) {
  const { demoMode } = useDemoMode();
  const categoryArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminResourceSuggestionsPageVM>({
    queryKey: ["admin-resource-suggestions", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_RESOURCE_SUGGESTIONS } =
          await import("../adminResourceSuggestions.data");
        const filtered = categoryArg
          ? ADMIN_RESOURCE_SUGGESTIONS.filter(
              (suggestion) => suggestion.category === categoryArg,
            )
          : ADMIN_RESOURCE_SUGGESTIONS;
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminResourceSuggestions({
        page: pageParam as number,
        category: categoryArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const suggestions = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, suggestions, total };
}
