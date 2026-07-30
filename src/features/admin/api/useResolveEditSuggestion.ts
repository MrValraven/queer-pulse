import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  patchEditSuggestionStatus,
  type EditSuggestionDTO,
} from "./editSuggestions.api";
import { EDIT_SUGGESTIONS_KEY } from "./useEditSuggestions";

/** How long demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 400;

export interface ResolveEditSuggestionVars {
  suggestion: EditSuggestionDTO;
  status: "accepted" | "dismissed";
}

/**
 * A moderator accepts or dismisses a member's edit suggestion. Demo mode
 * resolves after a short simulated delay and never touches the network — the
 * fixture must not appear to mutate platform truth (mirrors
 * `useSetListingStatus`). Live mode PATCHes
 * `/listings/admin/edit-suggestions/:id` and invalidates the list query.
 */
export function useResolveEditSuggestion() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<EditSuggestionDTO, Error, ResolveEditSuggestionVars>({
    mutationFn: async ({ suggestion, status }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.editSuggestion.resolve (demo — no network)", {
          id: suggestion.id,
          status,
        });
        return { ...suggestion, status };
      }
      return patchEditSuggestionStatus(suggestion.id, status);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [EDIT_SUGGESTIONS_KEY] });
    },
  });
}
