import { useCallback, useEffect, useState } from "react";
import { SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminDrawer } from "./ui";
import { AdminMemberDrawerSkeleton } from "./AdminMemberDrawerSkeleton";
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

/**
 * The drawer frame while a member card is still loading. Live mode fetches
 * over the network, so the slide-over opens straight away with its body
 * skeletoned rather than leaving the click with no visible result. Demo mode
 * resolves from the fixtures instantly and never renders this.
 */
export function AdminMemberCardLoadingDrawer({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminDrawer
      label={t("admin:members.flagged.loadingDrawerLabel")}
      onClose={onClose}
      head={<SkeletonLine width={180} height={22} />}
    >
      <AdminMemberDrawerSkeleton />
    </AdminDrawer>
  );
}
