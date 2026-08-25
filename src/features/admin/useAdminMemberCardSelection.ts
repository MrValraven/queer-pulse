import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdminMemberCard } from "./api/useAdminMembers";
import type { AdminMember } from "./adminMembers.data";

/**
 * Drawer selection for a member who is not on the loaded roster page. This is
 * what the flagged queue needs, since a flagged member is fetched by id
 * rather than read back out of the list the way `AdminMembersPage` resolves a
 * roster row.
 *
 * The card comes from `useAdminMemberCard` (the fixtures in demo mode, `GET
 * /admin/members/:id` in live mode). While it is in flight the caller renders
 * {@link AdminMemberCardLoadingDrawer}; if the fetch fails the selection is
 * dropped and an error toast says so, so the operator never faces an empty
 * drawer that reads as "this member has no record".
 *
 * Split into its own module (sibling to `AdminMemberCardSelection.tsx`)
 * because a hook export alongside a component export defeats Fast Refresh.
 */
export function useAdminMemberCardSelection() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const {
    data: memberCard,
    isPending,
    isError,
  } = useAdminMemberCard(selectedMemberId);

  const clearSelection = useCallback(() => setSelectedMemberId(null), []);

  useEffect(() => {
    if (selectedMemberId === null || !isError) return;
    // Genuine external-system reaction: this is subscribing to the query's
    // error state (a network result), and the setState is inseparable from
    // the showToast call right below it (clear the failed selection at the
    // same moment the operator is told it failed). Neither can move to
    // render: showToast is an imperative side effect that must not run
    // during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setSelectedMemberId(null);
    showToast(t("admin:members.flagged.loadErrorToast"), "error");
  }, [isError, selectedMemberId, showToast, t]);

  const resolvedCard: AdminMember | null =
    selectedMemberId === null ? null : (memberCard ?? null);

  return {
    /** The fetched card, or `null` while nothing is selected or in flight. */
    memberCard: resolvedCard,
    /** True only while a real selection is still waiting on its card. */
    isPending: selectedMemberId !== null && isPending,
    selectMember: setSelectedMemberId,
    clearSelection,
  };
}
