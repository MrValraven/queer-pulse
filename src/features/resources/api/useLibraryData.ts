import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { GUIDES, type Guide } from "../library.data";
import { getResources } from "./resources.api";
import { resourceToGuide } from "./resources.adapters";

export interface LibraryDataResult {
  guides: Guide[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

/** Stable empty array so the "no data yet" case doesn't churn identity every render. */
const EMPTY_GUIDES: Guide[] = [];

/**
 * Data source for the Guide Library (`LibraryPage`).
 *
 * Demo mode returns the page's own `GUIDES` mock unchanged. Live mode calls
 * GET /resources once (the dozen seeded guides fit comfortably inside the
 * default page size, so a single unfiltered fetch covers the whole library)
 * and adapts each row to the page's local `Guide` shape — the page's own
 * category/search filtering (`useMemo` over the returned list) stays
 * entirely client-side in both modes, unchanged.
 */
export function useLibraryData(): LibraryDataResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<Guide[]>({
    queryKey: ["resources", "library"],
    enabled: !demoMode,
    queryFn: async () => {
      const page = await getResources({});
      return page.items.map(resourceToGuide);
    },
  });

  if (demoMode) {
    return { guides: GUIDES, loading: false };
  }
  return { guides: query.data ?? EMPTY_GUIDES, loading: query.isPending };
}
