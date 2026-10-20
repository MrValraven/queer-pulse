import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityEdits } from "../../../app/providers/useCommunityEdits";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  demoGivingFor,
  demoGivingFromBody,
} from "../giving/communityGiving.data";
import {
  getCommunityGiving,
  putCommunityGiving,
  type CommunityGivingDTO,
  type UpdateCommunityGivingBody,
} from "./communityGiving.api";

/**
 * A community's support section. Demo answers synchronously from the session
 * store (`CommunityEditsProvider`) and falls back to the seeded fixtures; live
 * calls GET /communities/:slug/giving. The page decides tab and sidebar card
 * visibility from `useGivingMethodCount`, so it never fetches the values just
 * to know whether there are any.
 */

export interface CommunityGivingResult {
  giving: CommunityGivingDTO | null;
  isLoading: boolean;
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

const NOOP = () => {};

/** Language is in the key per house convention; the data is language-free, so
 *  a language switch costs one refetch. */
export const communityGivingKey = (
  slug: string | undefined,
  isDemoMode: boolean,
  language: string,
) => ["community-giving", slug, isDemoMode, language] as const;

export function useCommunityGiving(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
): CommunityGivingResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const { givingOverrideFor } = useCommunityEdits();
  const query = useQuery<CommunityGivingDTO>({
    queryKey: communityGivingKey(slug, demoMode, language),
    enabled: enabled && !demoMode && Boolean(slug),
    queryFn: () => getCommunityGiving(slug!),
  });

  if (demoMode) {
    const giving = slug
      ? (givingOverrideFor(slug) ?? demoGivingFor(slug))
      : null;
    return { giving, isLoading: false, isError: false, refetch: NOOP };
  }
  // Status-based: a query paused offline has no data and is not fetching, so
  // `isLoading` would read false and the section would pass for empty.
  return {
    giving: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** Demo derives the count from the session giving data; live reads the detail
 *  DTO's count and never fetches here. */
export function useGivingMethodCount(
  slug: string | undefined,
  liveCount: number,
): number {
  const { demoMode } = useDemoMode();
  const { giving } = useCommunityGiving(slug, { enabled: false });
  return demoMode ? (giving?.methods.length ?? 0) : liveCount;
}

/**
 * PUT /communities/:slug/giving, replacing the whole set. Demo stores the
 * saved section in the session store instead. Live writes the answer into the
 * giving cache and refetches the detail query so `givingMethodCount` (tab and
 * sidebar card visibility) follows the save.
 */
export function useSaveCommunityGiving(
  slug: string | undefined,
): UseMutationResult<CommunityGivingDTO, Error, UpdateCommunityGivingBody> {
  const { demoMode } = useDemoMode();
  const { applyGivingOverride } = useCommunityEdits();
  const queryClient = useQueryClient();
  return useMutation<CommunityGivingDTO, Error, UpdateCommunityGivingBody>({
    // The editor toasts its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (!slug) throw new Error("useSaveCommunityGiving needs a slug");
      if (demoMode) return demoGivingFromBody(body, new Date().toISOString());
      return putCommunityGiving(slug, body);
    },
    onSuccess: (saved) => {
      if (!slug) return;
      if (demoMode) {
        applyGivingOverride(slug, saved);
        return;
      }
      queryClient.setQueriesData<CommunityGivingDTO>(
        { queryKey: ["community-giving", slug, false] },
        saved,
      );
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}
