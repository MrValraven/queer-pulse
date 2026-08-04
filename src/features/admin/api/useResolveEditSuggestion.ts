import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  patchEditSuggestionStatus,
  type EditSuggestionDTO,
} from "./editSuggestions.api";
import { EDIT_SUGGESTIONS_KEY } from "./useEditSuggestions";
import { useDemoAwareMutation } from "./demoAwareMutation";

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
  return useDemoAwareMutation<EditSuggestionDTO, Error, ResolveEditSuggestionVars>({
    demoMode,
    logLabel: "admin.editSuggestion.resolve",
    logContext: ({ suggestion, status }) => ({ id: suggestion.id, status }),
    demoResult: ({ suggestion, status }) => ({ ...suggestion, status }),
    live: ({ suggestion, status }) =>
      patchEditSuggestionStatus(suggestion.id, status),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [EDIT_SUGGESTIONS_KEY] });
    },
  });
}
