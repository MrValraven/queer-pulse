import { AdminShell } from "../../shared/components/layout/AdminShell";
import { FadeIn, FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminPageHeader, AdminTabs } from "./ui";
import { AdminReportDrawer } from "./AdminReportDrawer";
import { AdminAppealDrawer } from "./AdminAppealDrawer";
import { OpenPane, AppealsPane, ResolvedPane } from "./AdminModerationPanes";
import {
  useModerationQueue,
  type TabId,
  type FilterId,
} from "./useModerationQueue";
import styles from "./AdminModerationPage.module.css";

export function AdminModerationPage() {
  const { t } = useTranslation();
  const q = useModerationQueue();
  const { tab, filter } = q;

  const FILTERS: { id: FilterId; labelKey: string }[] = [
    { id: "all", labelKey: "admin:moderation.filters.all" },
    { id: "emergencies", labelKey: "admin:moderation.filters.emergencies" },
    { id: "mine", labelKey: "admin:moderation.filters.mine" },
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
          </div>
        )}
      </div>

      {tab === "open" && <OpenPane q={q} />}
      {tab === "appeals" && <AppealsPane q={q} />}
      {tab === "resolved" && <ResolvedPane q={q} />}

      {q.selected && (
        <AdminReportDrawer
          report={q.selected}
          onClose={() => q.setSelected(null)}
          onResolve={(id, opts) => q.resolveReport(id, opts)}
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
