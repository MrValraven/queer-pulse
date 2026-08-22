import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_EDIT_SUGGESTIONS } from "../editSuggestions.data";
import {
  getEditSuggestions,
  type EditSuggestionDTO,
  type EditSuggestionStatus,
} from "./editSuggestions.api";

/** Shared with `useResolveEditSuggestion`, which invalidates this key on
 *  success. Keyed by status so a status-scoped fetch and the "all" fetch
 *  don't clobber each other's cache entry. */
export const EDIT_SUGGESTIONS_KEY = "admin-edit-suggestions";

/**
 * Member-submitted "suggest an edit" corrections, optionally filtered by
 * lifecycle status. Demo mode filters the colocated fixture locally and
 * never hits the network — this is a Moderator/Admin-only endpoint that 403s
 * for anyone else. Live mode forwards `status` as the `?status=` query param
 * `GET /admin/listings/edit-suggestions` accepts.
 */
export function useEditSuggestions(status?: EditSuggestionStatus) {
  const { demoMode } = useDemoMode();
  const query = useQuery<EditSuggestionDTO[]>({
    queryKey: [EDIT_SUGGESTIONS_KEY, demoMode, status ?? "all"],
    initialData: demoMode ? filterDemo(status) : undefined,
    queryFn: async () => {
      if (demoMode) return filterDemo(status);
      return getEditSuggestions(status);
    },
  });
  return { ...query, rows: query.data ?? [] };
}

function filterDemo(status?: EditSuggestionStatus): EditSuggestionDTO[] {
  return status
    ? ADMIN_EDIT_SUGGESTIONS.filter((row) => row.status === status)
    : ADMIN_EDIT_SUGGESTIONS;
}
