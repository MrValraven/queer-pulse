import { useMemo, useState } from "react";
import {
  Button,
  FadeIn,
  FeatureHelp,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminMemberRows, AdminFlaggedRows } from "./AdminMemberRows";
import { AdminVerifyQueue } from "./AdminVerifyQueue";
import { AdminMemberDrawer } from "./AdminMemberDrawer";
import { AdminMemberCardLoadingDrawer } from "./AdminMemberCardSelection";
import { useAdminMemberCardSelection } from "./useAdminMemberCardSelection";
import {
  AdminMembersSearchControls,
  type StatusFilter,
} from "./AdminMembersSearchControls";
import { useAdminMembers, useAdminFlagged } from "./api/useAdminMembers";
import { useJoinRequests } from "./api/useJoinRequests";
import styles from "./AdminMembersPage.module.css";

// No "sample" tab here. The quality sample lives beside the queue it reviews,
// as a tab of `AdminVerifyQueue`, reachable at /admin/join-requests, which
// `authGate.ts` opens to moderators, while this page stays admin-only. It was
// rendered in both places, so an admin saw the same view twice.
type TabId = "all" | "pending" | "flagged";

export function AdminMembersPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
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

  const {
    members,
    total,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminMembers(filter);
  const { data: flagged = [] } = useAdminFlagged();
  const pendingCount = useJoinRequests("pending").data?.length ?? 0;

  // Client-side name search over the members already loaded. It narrows what's
  // on screen without a refetch; server-side pagination ("Load more") is hidden
  // while a query is active so we never imply results beyond what we've matched.
  const query = search.trim().toLowerCase();
  const visibleMembers = useMemo(
    () =>
      query
        ? members.filter(
            (member) =>
              member.name.toLowerCase().includes(query) ||
              member.pronoun.toLowerCase().includes(query),
          )
        : members,
    [members, query],
  );

  // Resolved from the full roster on every render, so the drawer always shows
  // the member as the list currently has them, and typing in the search box
  // behind the drawer leaves it open.
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
    },
    {
      id: "flagged",
      label: t("admin:members.tabs.flagged"),
      count: flagged.length,
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
        <AdminPageHeader
          eyebrow={t("admin:members.header.eyebrow")}
          title={
            <>
              {t("admin:members.header.titleLine1", {
                total: fmt.number(total),
              })}
              <br />
              <Translation
                i18nKey="admin:members.header.titleLine2"
                components={{ em: <em /> }}
              />{" "}
              <FeatureHelp id="admin.members" />
            </>
          }
          sub={t("admin:members.header.sub", { count: pendingCount })}
          actions={
            <Button variant="ghost" size="md">
              {t("admin:members.header.exportCta")}
            </Button>
          }
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
        {tab === "all" &&
          (isLoading ? (
            <MemberRowsSkeleton />
          ) : (
            <>
              <AdminMemberRows
                members={visibleMembers}
                onSelect={(member) => setSelectedMemberId(member.id)}
              />
              {hasNextPage && !query && (
                <div className={styles.loadMore}>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => void fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {t("admin:members.loadMore")}
                  </Button>
                </div>
              )}
            </>
          ))}
        {tab === "pending" && <AdminVerifyQueue />}
        {tab === "flagged" && (
          <AdminFlaggedRows
            members={flagged}
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
    </AdminShell>
  );
}

function MemberRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3, 4].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={64}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
