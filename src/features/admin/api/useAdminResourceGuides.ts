import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  ADMIN_GLOSSARY_TERMS_DEMO,
  ADMIN_RESOURCE_GUIDES_DEMO,
} from "../adminResourceGuides.data";
import {
  getAdminGlossaryTerms,
  getAdminResourceGuide,
  getAdminResourceGuides,
  type AdminGlossaryTermDTO,
  type AdminResourceGuideDTO,
  type AdminResourceSort,
} from "./adminResourceGuides.api";

export const ADMIN_RESOURCE_GUIDES_KEY = "admin-resource-guides";
export const ADMIN_GLOSSARY_TERMS_KEY = "admin-glossary-terms";

/**
 * Every guide, published or not, for the admin editor (CON-08/CON-09).
 *
 * The default `reviewDue` sort with never-reviewed guides first is what makes
 * this list answer "which guides are stale?" — the question nobody on the
 * team could answer before, because the only freshness field was set by hand
 * with a SQL statement.
 */
export function useAdminResourceGuides(params: {
  category?: string;
  sort?: AdminResourceSort;
}) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminResourceGuideDTO[]>({
    queryKey: [
      ADMIN_RESOURCE_GUIDES_KEY,
      demoMode,
      params.category,
      params.sort,
    ],
    initialData: demoMode ? ADMIN_RESOURCE_GUIDES_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_RESOURCE_GUIDES_DEMO : getAdminResourceGuides(params),
  });
}

/** Query key for one guide. Starts with `ADMIN_RESOURCE_GUIDES_KEY`, so the
 *  mutations' existing invalidation reaches it too. */
export function adminResourceGuideKey(id: string, demoMode: boolean) {
  return [ADMIN_RESOURCE_GUIDES_KEY, "detail", demoMode, id] as const;
}

/**
 * One guide for the workspace. `null` when the id matches nothing, which in
 * demo mode is always, because the demo list is honestly empty.
 *
 * `refetchOnWindowFocus` is off: the workspace reads this once to seed its
 * draft, and a silent background refetch must never move the `updatedAt`
 * the save conflict check compares against.
 */
export function useAdminResourceGuide(id: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminResourceGuideDTO | null>({
    queryKey: adminResourceGuideKey(id ?? "", demoMode),
    enabled: id !== undefined,
    refetchOnWindowFocus: false,
    queryFn: () =>
      demoMode
        ? (ADMIN_RESOURCE_GUIDES_DEMO.find((guide) => guide.id === id) ?? null)
        : getAdminResourceGuide(id ?? ""),
  });
}

/** Every glossary term, stalest first. The page tells readers the glossary is
 *  maintained by Trans Hub and Wellbeing; this is where they maintain it. */
export function useAdminGlossaryTerms() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminGlossaryTermDTO[]>({
    queryKey: [ADMIN_GLOSSARY_TERMS_KEY, demoMode],
    initialData: demoMode ? ADMIN_GLOSSARY_TERMS_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_GLOSSARY_TERMS_DEMO : getAdminGlossaryTerms(),
  });
}
