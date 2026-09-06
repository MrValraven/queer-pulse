import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { submitGroupJoinRequest } from "./housingGroups.api";
import { economyKeys } from "./economyKeys";

export interface GroupJoinRequestInput {
  slug: string;
  name: string;
  relationship: string;
  answers?: { questionId: string; answer: string }[];
  note?: string;
}

/**
 * POST /housing-groups/:slug/join-requests — a prospective member asking to
 * join an access-gated group, with their screening answers. Demo mode keeps a
 * short "sending…" beat and resolves with no network (mirrors
 * `useSubmitCoopJoinRequest`). Live mode calls the API.
 *
 * PRD-242: a success invalidates the caller's own applications, so the new
 * pending row appears on the group page from the server rather than from a
 * guess, and the page the outcome will later deep-link to already names it.
 */
export function useSubmitGroupJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ id: string } | null, Error, GroupJoinRequestInput>({
    // JoinGroupModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug, name, relationship, answers, note }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return submitGroupJoinRequest(slug, {
        name,
        relationship,
        answers,
        note,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: economyKeys.myGroupJoinRequestsRoot,
      });
    },
  });
}
