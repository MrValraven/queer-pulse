import { FiX } from "react-icons/fi";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { FadeIn, FeatureHelp, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminPageHeader, AdminTabs } from "./ui";
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

  // TS-06 adds the last two: the reports whose response window has already
  // closed, and the subjects several different people are reporting at once.
  const FILTERS: { id: FilterId; labelKey: string }[] = [
    { id: "all", labelKey: "admin:moderation.filters.all" },
    { id: "emergencies", labelKey: "admin:moderation.filters.emergencies" },
    { id: "mine", labelKey: "admin:moderation.filters.mine" },
    { id: "overdue", labelKey: "admin:moderation.filters.overdue" },
    { id: "surge", labelKey: "admin:moderation.filters.surge" },
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
          eyebrow={t("admin:moderation.header.eyebrow")}
          title={
            <>
              {q.counts.open === 0 ? (
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
              )}{" "}
              <FeatureHelp id="admin.moderation" />
            </>
          }
          sub={t("admin:moderation.header.sub")}
        />
      </FadeIn>

      {q.subjectId && (
        <div className={styles.subjectFilter}>
          <span>
            {t("admin:moderation.subjectFilter.label", {
              subjectId: q.subjectId,
            })}
          </span>
          <button
            type="button"
            onClick={q.clearSubjectFilter}
            aria-label={t("admin:moderation.subjectFilter.clearAriaLabel")}
          >
            <FiX aria-hidden />
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
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
            // TS-12. Its own tab rather than a banner on the open queue:
            // nothing on it is a report, and a hold nobody can find is a hold
            // nobody ratifies, which would quietly turn every permanent ban
            // into a 72-hour suspension.
            {
              id: "ratification",
              label: t("admin:moderation.tabs.ratification"),
              count: q.counts.ratification,
            },
            // TS-04. No count: this tab is not a pile of items to work
            // through, it is the reading on the four piles that are.
            { id: "health", label: t("admin:moderation.tabs.health") },
          ]}
          active={tab}
          onChange={(id) => q.setTab(id as TabId)}
        />
        {tab === "open" && (
          <div
            className={styles.filters}
            role="group"
            aria-label={t("admin:moderation.filterAriaLabel")}
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                className={[styles.filter, filter === f.id && styles.filterOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => q.setFilter(f.id)}
              >
                {t(f.labelKey)}
              </button>
            ))}
            {q.communityOptions.length > 0 && (
              <Select
                size="sm"
                className={styles.communityFilter}
                label={t("admin:moderation.community.filterLabel")}
                options={communityOptions}
                value={q.community}
                onChange={(value) => q.setCommunity(value ?? ALL_COMMUNITIES)}
              />
            )}
          </div>
        )}
      </div>

      {/* TS-04. Above the queue a moderator came here to work, and silent
          unless a queue is at warning or critical, so it reads as news rather
          than as standing pressure. Suppressed on the health tab itself, which
          is the thing it links to. */}
      {tab !== "health" && <ModerationHealthIndicator />}

      {tab === "open" && <OpenPane q={q} />}
      {tab === "appeals" && <AppealsPane q={q} />}
      {tab === "resolved" && <ResolvedPane q={q} />}
      {tab === "ratification" && <RatificationPane q={q} />}
      {tab === "health" && <ModerationQueueHealthPanel />}

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
