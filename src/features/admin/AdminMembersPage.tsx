import { useMemo, useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminMemberRows, AdminFlaggedRows } from "./AdminMemberRows";
import { AdminVerifyQueue } from "./AdminVerifyQueue";
import { AdminMemberDrawer } from "./AdminMemberDrawer";
import {
  MEMBERS,
  FLAGGED,
  VERIFY_PENDING_COUNT,
  type AdminMember,
} from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

type TabId = "all" | "pending" | "flagged";
type StatusFilter = "all" | "verified" | "new";

const TABS: AdminTab[] = [
  { id: "all", label: "All members" },
  { id: "pending", label: "Verification pending", count: VERIFY_PENDING_COUNT },
  { id: "flagged", label: "Flagged", count: FLAGGED.length },
];

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "verified", label: "Verified" },
  { id: "new", label: "New this week" },
];

export function AdminMembersPage() {
  const [tab, setTab] = useState<TabId>("all");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<AdminMember | null>(null);

  const visibleMembers = useMemo(() => {
    if (filter === "verified") return MEMBERS.filter((m) => m.verified);
    if (filter === "new") return MEMBERS.filter((m) => m.newThisWeek);
    return MEMBERS;
  }, [filter]);

  return (
    <AdminShell
      title={
        <>
          Members · <em>the people</em>
        </>
      }
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow="Member directory"
          title={
            <>
              8,412 people,
              <br />
              each one <em>vouched for</em>.
            </>
          }
          sub="Not rows in a table — members someone trusted enough to bring in. Pronouns and chosen names are the only names shown here. Eleven people are waiting to be welcomed in."
          actions={
            <Button variant="ghost" size="md">
              Export
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
              aria-label="Filter members"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.filterPill} ${filter === f.id ? styles.filterPillOn : ""}`}
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={140}>
        {tab === "all" && (
          <AdminMemberRows members={visibleMembers} onSelect={setSelected} />
        )}
        {tab === "pending" && <AdminVerifyQueue />}
        {tab === "flagged" && <AdminFlaggedRows members={FLAGGED} />}
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
