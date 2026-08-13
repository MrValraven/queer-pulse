import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { submitGroupJoinRequest } from "./housingGroups.api";

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
 */
export function useSubmitGroupJoinRequest() {
  const { demoMode } = useDemoMode();
  return useMutation<{ id: string } | null, Error, GroupJoinRequestInput>({
    // JoinGroupModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug, name, relationship, answers, note }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return submitGroupJoinRequest(slug, { name, relationship, answers, note });
    },
  });
}
