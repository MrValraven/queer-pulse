import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  ADMIN_GLOSSARY_TERMS_DEMO,
  ADMIN_RESOURCE_GUIDES_DEMO,
} from "../adminResourceGuides.data";
import {
  getAdminGlossaryTerms,
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
