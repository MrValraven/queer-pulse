import { useMemo, useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminTabs, type AdminTab } from "./ui";
import { AdminMembersHeader } from "./AdminMembersHeader";
import { AdminFlaggedTab } from "./AdminFlaggedTab";
import { AdminMembersRoster } from "./AdminMembersRoster";
import { AdminVerifyQueue } from "./AdminVerifyQueue";
import { AdminMemberDrawer } from "./AdminMemberDrawer";
import { AdminMemberCardLoadingDrawer } from "./AdminMemberCardSelection";
import { useAdminMemberCardSelection } from "./useAdminMemberCardSelection";
import {
  AdminMembersSearchControls,
  type StatusFilter,
} from "./AdminMembersSearchControls";
import { AdminEmailSuppressionModal } from "./AdminEmailSuppressionModal";
import { useAdminMembers, useAdminFlagged } from "./api/useAdminMembers";
import { useJoinRequests } from "./api/useJoinRequests";
import { hasFailedWithoutData } from "./queryLoadFailure";
import styles from "./AdminMembersPage.module.css";

// No "sample" tab here. The quality sample lives beside the queue it reviews,
// as a tab of `AdminVerifyQueue`, reachable at /admin/join-requests, which
// `authGate.ts` opens to moderators, while this page stays admin-only. It was
// rendered in both places, so an admin saw the same view twice.
type TabId = "all" | "pending" | "flagged";

export function AdminMembersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>("all");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  // Only the selected member's id is held here. The drawer reads the member
  // object back out of the live roster below, so a verify/restrict that
  // refetches the list updates the open drawer instead of leaving it pinned to
  // the row object as it looked when it was clicked.
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  // The flagged queue lists people who are usually not on the loaded roster
  // page, so its selection is fetched by id instead of resolved from `members`
  // below. Both feed the one drawer at the bottom of this page.
  const flaggedSelection = useAdminMemberCardSelection();
  // The erasure suppression list belongs to no member (the account it protected
  // was erased), so it opens from the page header rather than a member drawer.
  const [isSuppressionOpen, setIsSuppressionOpen] = useState(false);

  // The search runs on the server across every page (see `useAdminMembers`),
  // so "Load more" stays available while a query is active.
  const roster = useAdminMembers(filter, search);
  const { members, total, isLoading } = roster;
  const flaggedQuery = useAdminFlagged();
  // DES-424: a count shows only once its read has answered. While loading or
  // after a failed read these stay `undefined`, so the tabs show no number
  // and the header uses its count-free copy.
  // A failed read marks its tab (N4) so it reads apart from one still loading.
  const pendingQuery = useJoinRequests("pending");
  const pendingCount = pendingQuery.data?.length;
  const flaggedCount = flaggedQuery.data?.length;
  const hasRosterTotal = roster.data !== undefined;

  // Resolved from the roster on every render, so the drawer always shows the
  // member as the list currently has them.
  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId],
  );

  // A member who leaves the roster (filtered out, or gone after a refetch)
  // takes the drawer with them, and the stale id is dropped so they can't pop
  // back open later. Adjusted during render (rather than in an effect): the
  // condition is derived entirely from render-available values, and clearing
  // it here means the current render already reflects the closed drawer
  // instead of painting a stale one first. `selectedMemberId !== null` is
  // false on the next render, so this terminates.
  if (
    selectedMemberId !== null &&
    !isLoading &&
    !members.some((member) => member.id === selectedMemberId)
  ) {
    setSelectedMemberId(null);
  }

  // One drawer serves both tabs: a roster row resolves to a member object
  // straight away, a flagged row arrives once its card has been fetched.
  const drawerMember = selectedMember ?? flaggedSelection.memberCard;
  const closeDrawer = () => {
    setSelectedMemberId(null);
    flaggedSelection.clearSelection();
  };

  const TABS: AdminTab[] = [
    { id: "all", label: t("admin:members.tabs.all") },
    {
      id: "pending",
      label: t("admin:members.tabs.pending"),
      count: pendingCount,
      isCountUnavailable: hasFailedWithoutData(pendingQuery),
    },
    {
      id: "flagged",
      label: t("admin:members.tabs.flagged"),
      count: flaggedCount,
      isCountUnavailable: hasFailedWithoutData(flaggedQuery),
    },
  ];

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:members.title"
          components={{ em: <em /> }}
        />
      }
    >
      <FadeIn>
        <AdminMembersHeader
          total={hasRosterTotal ? total : undefined}
          pendingCount={pendingCount}
          onOpenSuppression={() => setIsSuppressionOpen(true)}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <div className={styles.toolbar}>
          <AdminTabs
            tabs={TABS}
            active={tab}
            onChange={(id) => setTab(id as TabId)}
          />
          {tab === "all" && (
            <AdminMembersSearchControls
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}
        </div>
      </FadeIn>

      <FadeIn delay={140}>
        {tab === "all" && (
          <AdminMembersRoster
            roster={roster}
            onSelect={(member) => setSelectedMemberId(member.id)}
          />
        )}
        {tab === "pending" && <AdminVerifyQueue />}
        {tab === "flagged" && (
          <AdminFlaggedTab
            flaggedQuery={flaggedQuery}
            onOpenMember={flaggedSelection.selectMember}
          />
        )}
      </FadeIn>

      {drawerMember && (
        <AdminMemberDrawer member={drawerMember} onClose={closeDrawer} />
      )}
      {!drawerMember && flaggedSelection.isPending && (
        <AdminMemberCardLoadingDrawer onClose={closeDrawer} />
      )}
      {isSuppressionOpen && (
        <AdminEmailSuppressionModal
          onClose={() => setIsSuppressionOpen(false)}
        />
      )}
    </AdminShell>
  );
}
