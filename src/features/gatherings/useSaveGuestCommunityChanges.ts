import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { codedReasonFor } from "../../shared/api/errorHandling";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  EventGuestCommunityView,
  GuestCommunityChanges,
} from "./api/eventCommunities.api";
import { eventCommunityKeys } from "./api/eventCommunityKeys";
import { useApplyGuestCommunityChanges } from "./api/useEventGuestCommunities";
import { hasGuestCommunityChanges } from "./guestCommunities";

/**
 * Sends one save's guest invites and removals, and says how many did not
 * go through. The gathering's own edit has already saved by then, so a
 * refusal (cap reached, a community frozen meanwhile) warns once and the
 * host can try again from Edit details. A coded refusal names its reason
 * in place of the count.
 */
export function useSaveGuestCommunityChanges(
  slug: string,
): (changes: GuestCommunityChanges) => void {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const applyChanges = useApplyGuestCommunityChanges(slug);
  return (changes) => {
    if (!hasGuestCommunityChanges(changes)) return;
    void applyChanges(changes).then(({ failedCount, firstRejection }) => {
      if (failedCount === 0) return;
      // A coded refusal (a house Music event takes no guest communities,
      // say) names its reason; a retry would meet the same answer.
      showToast(
        codedReasonFor(firstRejection) ??
          t("gatherings:guestCommunities.saveFailed", { count: failedCount }),
        "warning",
      );
    });
  };
}

/**
 * Brings the guest list up to date after a saved PATCH moved the lead. The
 * server drops a guest that became the lead in that PATCH, so the editor's
 * saved list would still hold it, and a later lead move would send a
 * removal for a row that is gone. Live reads the list again; demo drops the
 * row from its cached list, the way `useApplyGuestCommunityChanges` patches
 * it there. Clearing the lead changes no row, so it reads nothing.
 */
export function useRefreshGuestListAfterLeadChange(
  slug: string,
): (leadSlug: string) => void {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return (leadSlug) => {
    if (leadSlug === "") return;
    if (demoMode) {
      queryClient.setQueryData<EventGuestCommunityView[]>(
        eventCommunityKeys.guestList(slug, true),
        (current) =>
          current?.filter((view) => view.community.slug !== leadSlug),
      );
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: eventCommunityKeys.guestList(slug, false),
    });
  };
}
