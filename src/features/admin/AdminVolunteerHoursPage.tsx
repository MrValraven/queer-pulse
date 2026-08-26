import { useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { routes } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader, AdminSeg } from "./ui";
import { useAdminVolunteerHours } from "./api/useAdminVolunteerHours";
import {
  VOLUNTEER_HOURS_PERIODS,
  type VolunteerHoursPeriod,
} from "./volunteerHoursPeriod";
import {
  VolunteerHoursByCommunityTable,
  VolunteerHoursByOpportunityTable,
} from "./AdminVolunteerHoursTables";
import styles from "./AdminVolunteerHoursPage.module.css";

/** One headline figure with its plain label. */
function Headline({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.headline}>
      <div className={styles.headlineValue}>{value}</div>
      <div className={styles.headlineLabel}>{label}</div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className={styles.skeletons}>
      <SkeletonLine height={104} style={{ borderRadius: 12 }} />
      <SkeletonLine height={180} style={{ borderRadius: 12 }} />
      <SkeletonLine height={180} style={{ borderRadius: 12 }} />
    </div>
  );
}

/**
 * Admin oversight of volunteering: the answer to "how many volunteer hours did
 * QueerPulse contribute" (SUS-05).
 *
 * Confirmed sessions, hours and how many people gave them, over a chosen
 * period, broken down by opportunity and by community. Only sessions a poster
 * confirmed as attended are counted, so nothing here is a promise somebody
 * made and did not keep.
 *
 * WHAT THIS PAGE WILL NOT SHOW: who volunteered most. These are aggregate
 * operational counts, which is what makes them fine to compute at all; a
 * ranking of members by their behaviour is a different thing and the backend
 * has no query for one. A member can read their own contribution on their own
 * profile, and nobody else can.
 */
export function AdminVolunteerHoursPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [period, setPeriod] = useState<VolunteerHoursPeriod>("months12");
  const { report, isLoading, isError } = useAdminVolunteerHours(period);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:volunteerHours.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:volunteerHours.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:volunteerHours.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:volunteerHours.header.sub")}
        />
      </FadeIn>

      {/* Above the figures, because the period is what the figures mean.
          Kept mounted through loading and empty states so a reader can always
          change it back. */}
      <div className={styles.periodRow}>
        <span className={styles.periodLabel}>
          {t("admin:volunteerHours.periodLabel")}
        </span>
        <AdminSeg
          options={VOLUNTEER_HOURS_PERIODS.map((option) => ({
            value: option,
            label: t(`admin:volunteerHours.period.${option}`),
          }))}
          value={period}
          onChange={(next) => setPeriod(next as VolunteerHoursPeriod)}
        />
      </div>

      {isLoading ? (
        <ReportSkeleton />
      ) : isError || !report ? (
        <p className={styles.note}>{t("admin:volunteerHours.error")}</p>
      ) : (
        <FadeIn>
          <div className={styles.headlines}>
            <Headline
              value={fmt.number(report.hoursContributed)}
              label={t("admin:volunteerHours.headline.hours")}
            />
            <Headline
              value={fmt.number(report.sessionCount)}
              label={t("admin:volunteerHours.headline.sessions")}
            />
            <Headline
              value={fmt.number(report.volunteerCount)}
              label={t("admin:volunteerHours.headline.volunteers")}
            />
          </div>

          <p className={styles.note}>{t("admin:volunteerHours.method")}</p>

          {report.sessionCount === 0 ? (
            <p className={styles.note}>{t("admin:volunteerHours.empty")}</p>
          ) : (
            <div className={styles.tables}>
              <VolunteerHoursByOpportunityTable
                rows={report.byOpportunity}
                isCapped={report.isOpportunityBreakdownCapped}
                limit={report.breakdownLimit}
              />
              <VolunteerHoursByCommunityTable
                rows={report.byCommunity}
                isCapped={report.isCommunityBreakdownCapped}
                limit={report.breakdownLimit}
              />
            </div>
          )}
        </FadeIn>
      )}
    </AdminShell>
  );
}
