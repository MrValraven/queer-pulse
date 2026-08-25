import { useState } from "react";
import { Badge, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
import { useMyReports, type MyReportEntry } from "./api/useMyReports";
import {
  REPORT_STATUS_LABEL_KEY,
  REPORT_STATUS_TONE,
} from "./whoSeesWhat.data";
import styles from "./WhoSeesWhatSheet.module.css";

/** One filed report: the reason (reusing the shared reporting taxonomy's own
 *  labels — `REASON_LABEL_KEYS`, the same lookup `ReportPage`/`FlagModal`
 *  render), the opaque reference code, "filed N days ago" via `Intl`, and a
 *  status pill reusing the shared `<Badge>` tone-pill primitive rather than a
 *  bespoke status style. */
function ReportRow({ report }: { report: MyReportEntry }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // `Date.now()` is impure — read once per mount via a lazy initializer
  // rather than during render (rules-of-React), same fix as
  // `AccountSuspendedPage.tsx`.
  const [now] = useState(() => Date.now());

  const daysAgo = Math.round(
    (Date.parse(report.createdAt) - now) / (24 * 60 * 60 * 1000),
  );
  const filedLabel = t("members:profile.whoSeesWhat.reports.filedTemplate", {
    time: fmt.relativeTime(daysAgo, "day"),
  });
  const reasonKey = REASON_LABEL_KEYS[report.reasonCode];
  const statusLabelKey = REPORT_STATUS_LABEL_KEY[report.status];

  return (
    <div className={styles.reportRow}>
      <div className={styles.reportMain}>
        <div className={styles.rowTitle}>
          {reasonKey ? t(reasonKey) : report.reasonCode}
        </div>
        <div className={styles.reportMeta}>
          <span className={styles.reportRef}>{report.reference}</span>
          <span aria-hidden>·</span>
          <span>{filedLabel}</span>
        </div>
      </div>
      <Badge tone={REPORT_STATUS_TONE[report.status] ?? "ghost"}>
        {statusLabelKey ? t(statusLabelKey) : report.status}
      </Badge>
    </div>
  );
}

/** Read-only receipt list of reports this member has filed themselves — not a
 *  moderation queue (that's `admin/AdminModerationPage.tsx`; this member sees
 *  only their own filings, never the reported content or mod actions). */
export function WhoSeesWhatReports() {
  const { t } = useTranslation();
  const { data: reports, isLoading, isError } = useMyReports();

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("members:profile.whoSeesWhat.reports.heading")}
      </h3>
      <p className={styles.sectionSub}>
        {t("members:profile.whoSeesWhat.reports.sub")}
      </p>

      {isLoading && <SkeletonLine width="80%" />}
      {isError && (
        <p className={styles.errorLine} role="alert">
          {t("members:profile.whoSeesWhat.reports.error")}
        </p>
      )}
      {!isLoading && !isError && (reports?.length ?? 0) === 0 && (
        <p className={styles.emptyLine}>
          {t("members:profile.whoSeesWhat.reports.empty")}
        </p>
      )}
      {!isLoading && (reports?.length ?? 0) > 0 && (
        <div className={styles.reportList}>
          {reports?.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </div>
      )}
    </section>
  );
}
