import { useMemo, useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
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

/** Total active members shown in the hero headline (mirrors the dashboard stat). */
const ACTIVE_MEMBER_COUNT = 8412;

export function AdminMembersPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [tab, setTab] = useState<TabId>("all");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<AdminMember | null>(null);

  const TABS: AdminTab[] = [
    { id: "all", label: t("admin:members.tabs.all") },
    {
      id: "pending",
      label: t("admin:members.tabs.pending"),
      count: VERIFY_PENDING_COUNT,
    },
    {
      id: "flagged",
      label: t("admin:members.tabs.flagged"),
      count: FLAGGED.length,
    },
  ];

  const FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: t("admin:members.filters.all") },
    { id: "verified", label: t("admin:members.filters.verified") },
    { id: "new", label: t("admin:members.filters.new") },
  ];

  const visibleMembers = useMemo(() => {
    if (filter === "verified") return MEMBERS.filter((m) => m.verified);
    if (filter === "new") return MEMBERS.filter((m) => m.newThisWeek);
    return MEMBERS;
  }, [filter]);

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
                total: fmt.number(ACTIVE_MEMBER_COUNT),
              })}
              <br />
              <Translation
                i18nKey="admin:members.header.titleLine2"
                components={{ em: <em /> }}
              />
            </>
          }
          sub={t("admin:members.header.sub", { count: VERIFY_PENDING_COUNT })}
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
