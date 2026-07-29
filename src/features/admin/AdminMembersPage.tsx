import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminMemberRows, AdminFlaggedRows } from "./AdminMemberRows";
import { AdminVerifyQueue } from "./AdminVerifyQueue";
import { AdminMemberDrawer } from "./AdminMemberDrawer";
import { useAdminMembers, useAdminFlagged } from "./api/useAdminMembers";
import { useJoinRequests } from "./api/useJoinRequests";
import { type AdminMember } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

type TabId = "all" | "pending" | "flagged";
type StatusFilter = "all" | "verified" | "new";

export function AdminMembersPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [tab, setTab] = useState<TabId>("all");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<AdminMember | null>(null);

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

  const FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: t("admin:members.filters.all") },
    { id: "verified", label: t("admin:members.filters.verified") },
    { id: "new", label: t("admin:members.filters.new") },
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
              />
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
            <div
              className={styles.filters}
              role="group"
              aria-label={t("admin:members.filterAriaLabel")}
            >
              {FILTERS.map((statusFilter) => (
                <button
                  key={statusFilter.id}
                  type="button"
                  className={`${styles.filterPill} ${filter === statusFilter.id ? styles.filterPillOn : ""}`}
                  aria-pressed={filter === statusFilter.id}
                  onClick={() => setFilter(statusFilter.id)}
                >
                  {statusFilter.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={140}>
        {tab === "all" &&
          (isLoading ? (
            <MemberRowsSkeleton />
          ) : (
            <>
              <AdminMemberRows members={members} onSelect={setSelected} />
              {hasNextPage && (
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
        {tab === "flagged" && <AdminFlaggedRows members={flagged} />}
      </FadeIn>

      {selected && (
        <AdminMemberDrawer
          member={selected}
          onClose={() => setSelected(null)}
        />
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
