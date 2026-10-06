import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  updateThreadFunding,
  type ForumThreadResponse,
} from "../api/forum.api";
import type { FundingInput } from "./funding.types";

/** PATCH the whole funding object. Demo resolves with null and the caller
 *  shows the saved details itself. The caller owns the error copy. */
export function useUpdateThreadFunding(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ForumThreadResponse | null, Error, FundingInput>({
    meta: { silentError: true },
    mutationFn: async (funding) => {
      if (demoMode) return null;
      if (!slug)
        throw new Error("Cannot edit funding details without the thread slug");
      return updateThreadFunding(slug, funding);
    },
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.setQueriesData<ForumThreadResponse>(
        { queryKey: ["forum-thread-meta", false, updated.slug] },
        updated,
      );
      void queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}
