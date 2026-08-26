import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getResourceGuide, type ResourceResponseDTO } from "./resources.api";

export interface ManagedGuideResult {
  /** The guide's database row, whether or not it has a body yet. A row with
   *  no sections is still worth having: it carries the review dates the
   *  footer prints under the hardcoded page. Null means no row at all. */
  guide: ResourceResponseDTO | null;
  /** True when the row carries prose, so the renderer takes the page over. */
  hasManagedBody: boolean;
  /** True while the live lookup is in flight. Demo resolves immediately. */
  isLoading: boolean;
}

/**
 * Asks whether one guide's prose is managed in the database yet (CON-08).
 *
 * Every `/resources/*` guide page renders through `ManagedGuide`, which calls
 * this. A guide with a non-empty `sections` array is rendered from the
 * database, so an editor changing a paragraph is an admin-panel edit rather
 * than an engineer editing two i18n catalogs and shipping a deploy.
 *
 * A row with no sections still matters: the hardcoded page renders unchanged,
 * and the row's review dates print in its footer, which is how the freshness
 * line reaches all ~31 guides and not only the ones already taken over. No
 * row at all, or a failed request, leaves the page exactly as it was.
 *
 * `retry: false` is deliberate: a 404 here is an expected, meaningful answer
 * ("not managed"), not a transient failure worth retrying, and a health guide
 * must never sit on a spinner waiting for retries to give up.
 *
 * Demo mode never queries. The demo guide pages ARE the hardcoded pages, so
 * asking the backend would either 401 or contradict the fixture.
 */
export function useManagedGuide(slug: string): ManagedGuideResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<ResourceResponseDTO | null>({
    queryKey: ["resources", "managed-guide", slug],
    enabled: !demoMode,
    retry: false,
    queryFn: async () => {
      try {
        return await getResourceGuide(slug);
      } catch {
        return null;
      }
    },
  });

  if (demoMode) {
    return { guide: null, hasManagedBody: false, isLoading: false };
  }
  const guide = query.data ?? null;
  return {
    guide,
    hasManagedBody: (guide?.sections.length ?? 0) > 0,
    isLoading: query.isPending,
  };
}
