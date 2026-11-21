import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityEdits } from "../../../app/providers/useCommunityEdits";
import { updateCommunity, type CommunityDetailDTO } from "./communities.api";
import type { CommunityResult } from "./useCommunity";

export interface DismissSetupChecklistVariables {
  slug: string;
}

/** Every cached detail for the slug as it stood before the dismissal, one
 *  entry per language key, so a failure can put each one back. */
interface DismissSetupChecklistContext {
  previousEntries: [QueryKey, CommunityResult | undefined][];
}

/**
 * A copy of the cached detail with its setup checklist marked dismissed. A
 * result that carries no checklist (a member, a space, a gate, an empty
 * cache) comes back as the same object.
 */
export function markSetupChecklistDismissed(
  result: CommunityResult | undefined,
): CommunityResult | undefined {
  if (!result?.setupChecklist) return result;
  return {
    ...result,
    setupChecklist: { ...result.setupChecklist, isDismissed: true },
  };
}

/**
 * PATCH /communities/:slug with `{ setupChecklistDismissed: true }`, the
 * staff "Dismiss checklist" action. Live mode hides the card in every cached
 * detail at once, puts the cache back if the server refuses, and re-reads the
 * detail once the call settles. Demo mode writes the session override store,
 * which the demo detail reads back.
 */
export function useDismissSetupChecklist(): UseMutationResult<
  CommunityDetailDTO | null,
  Error,
  DismissSetupChecklistVariables,
  DismissSetupChecklistContext | undefined
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { applyOverride } = useCommunityEdits();
  return useMutation<
    CommunityDetailDTO | null,
    Error,
    DismissSetupChecklistVariables,
    DismissSetupChecklistContext | undefined
  >({
    // The checklist card toasts the cause itself, so the global toast stays
    // quiet.
    meta: { silentError: true },
    onMutate: async ({ slug }) => {
      if (demoMode) return undefined;
      const communityKey = ["community", slug];
      await queryClient.cancelQueries({ queryKey: communityKey });
      const previousEntries = queryClient.getQueriesData<CommunityResult>({
        queryKey: communityKey,
      });
      queryClient.setQueriesData<CommunityResult>(
        { queryKey: communityKey },
        markSetupChecklistDismissed,
      );
      return { previousEntries };
    },
    mutationFn: async ({ slug }) => {
      if (demoMode) {
        applyOverride(slug, { setupChecklistDismissed: true });
        return null;
      }
      return updateCommunity(slug, { setupChecklistDismissed: true });
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      for (const [queryKey, previousResult] of context.previousEntries) {
        queryClient.setQueryData(queryKey, previousResult);
      }
    },
    onSettled: (_data, _error, { slug }) => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}
