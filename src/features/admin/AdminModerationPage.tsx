import { FiX } from "react-icons/fi";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import {
  Button,
  FadeIn,
  FilterChips,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  AdminNotice,
  AdminPageHeader,
  AdminTabs,
  AdminToolbar,
  adminToolbarClasses,
} from "./ui";
import { AdminReportDrawer } from "./AdminReportDrawer";
import { AdminAppealDrawer } from "./AdminAppealDrawer";
import {
  OpenPane,
  AppealsPane,
  RatificationPane,
  ResolvedPane,
} from "./AdminModerationPanes";
import { ModerationHealthIndicator } from "./ModerationHealthIndicator";
import { ModerationQueueHealthPanel } from "./ModerationQueueHealthPanel";
import {
  useModerationQueue,
  type TabId,
  type FilterId,
} from "./useModerationQueue";
import { ALL_COMMUNITIES } from "./moderationQueue.types";
import { MODERATION_FILTERS } from "./AdminModerationPage.data";
import styles from "./AdminModerationPage.module.css";

export function AdminModerationPage() {
  const { t } = useTranslation();
  const q = useModerationQueue();
  const { tab, filter } = q;

  // TS-14: which community a report came from is the most useful triage signal
  // the queue has, so it is also something to narrow by. Options are the
  // communities actually present in the loaded queue, plus "all".
  const communityOptions = [
    { value: ALL_COMMUNITIES, label: t("admin:moderation.community.all") },
    ...q.communityOptions.map((slug) => ({ value: slug, label: slug })),
  ];

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:moderation.title"
          components={{ em: <em /> }}
        />
      }
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.trust")}
          title={
            q.counts.open === 0 ? (
              <Translation
                i18nKey="admin:moderation.header.titleClear"
                components={{ em: <em /> }}
              />
            ) : (
              <Translation
                i18nKey="admin:moderation.header.title"
                components={{ em: <em /> }}
                values={{ count: q.counts.open }}
              />
            )
          }
          sub={t("admin:moderation.header.sub")}
        />
      </FadeIn>

      <div className={styles.body}>
        {q.subjectId && (
          <AdminNotice
            tone="info"
            action={
              <Button variant="quiet" size="sm" onClick={q.clearSubjectFilter}>
                <FiX aria-hidden />
                {t("admin:moderation.subjectFilter.clearAriaLabel")}
              </Button>
            }
          >
            {t("admin:moderation.subjectFilter.label", {
              subjectId: q.subjectId,
            })}
          </AdminNotice>
        )}

        <AdminTabs
          tabs={[
            {
              id: "open",
              label: t("admin:moderation.tabs.open"),
              count: q.counts.open,
            },
            {
              id: "appeals",
              label: t("admin:moderation.tabs.appeals"),
              count: q.counts.appeals,
            },
            {
              id: "resolved",
              label: t("admin:moderation.tabs.resolved"),
              count: q.counts.resolved,
            },
            // TS-12. Its own tab: nothing on it is a report, and a hold
            // nobody can find is a hold nobody ratifies, which would quietly
            // turn every permanent ban into a 72-hour suspension.
            {
              id: "ratification",
              label: t("admin:moderation.tabs.ratification"),
              count: q.counts.ratification,
            },
            // TS-04. No count: this tab is the reading on the four piles
            // above it, and holds no items of its own to work through.
            { id: "health", label: t("admin:moderation.tabs.health") },
          ]}
          active={tab}
          onChange={(id) => q.setTab(id as TabId)}
        />

        {tab === "open" && (
          <AdminToolbar label={t("admin:moderation.filterAriaLabel")}>
            <FilterChips
              className={adminToolbarClasses.chips}
              options={MODERATION_FILTERS.map((option) => ({
                value: option.id,
                label: t(option.labelKey),
              }))}
              value={filter}
              onChange={(value) => q.setFilter(value as FilterId)}
            />
            {q.communityOptions.length > 0 && (
              <Select
                size="sm"
                className={`${adminToolbarClasses.select} ${styles.communityFilter}`}
                label={t("admin:moderation.community.filterLabel")}
                options={communityOptions}
                value={q.community}
                onChange={(value) => q.setCommunity(value ?? ALL_COMMUNITIES)}
              />
            )}
          </AdminToolbar>
        )}

        {/* TS-04. Above the queue a moderator came here to work, and silent
            unless a queue is at warning or critical, so it reads as news
            and never as standing pressure. Suppressed on the health tab
            itself, which is the thing it links to. */}
        {tab !== "health" && <ModerationHealthIndicator isInStack />}

        {tab === "open" && <OpenPane q={q} />}
        {tab === "appeals" && <AppealsPane q={q} />}
        {tab === "resolved" && <ResolvedPane q={q} />}
        {tab === "ratification" && <RatificationPane q={q} />}
        {tab === "health" && <ModerationQueueHealthPanel />}
      </div>

      {q.selected && (
        <AdminReportDrawer
          report={q.selected}
          onClose={() => q.setSelected(null)}
          onResolve={(id, opts) => q.resolveReport(id, opts)}
          currentUserId={q.currentUserId}
          onAssignToMe={q.assignToMe}
          onUnassign={q.unassignReport}
        />
      )}

      {q.appeal && (
        <AdminAppealDrawer
          appeal={q.appeal}
          onClose={() => q.setAppeal(null)}
          onResolve={q.recordAppeal}
        />
      )}
    </AdminShell>
  );
}
