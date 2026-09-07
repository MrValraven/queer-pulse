import { useState } from "react";
import { Badge } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { REASON_LABEL_KEYS } from "./reportReasons";
import type { MyReportEntry } from "./api/useMyReports";
import { REPORT_STATUS_LABEL_KEY, REPORT_STATUS_TONE } from "./myReports.data";
import styles from "./MyReportRow.module.css";

/**
 * One filed report, as its own reporter sees it: the reason (reusing the
 * shared reporting taxonomy's own labels — `REASON_LABEL_KEYS`, the same
 * lookup `ReportPage`/`FlagModal` render), the reference code they can quote
 * back to the safety team, when it was filed, and a status pill reusing the
 * shared `<Badge>` tone-pill primitive rather than a bespoke status style.
 *
 * Shared by `MyReportsPage` (the full list at `/account/reports`) and
 * `WhoSeesWhatReports` (the summary inside the profile privacy sheet) so the
 * two surfaces cannot drift into rendering the same report differently.
 */
export function MyReportRow({ report }: { report: MyReportEntry }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // `Date.now()` is impure — read once per mount via a lazy initializer
  // rather than during render (rules-of-React), same fix as
  // `AccountSuspendedPage.tsx`.
  const [now] = useState(() => Date.now());

  const daysAgo = Math.round(
    (Date.parse(report.createdAt) - now) / (24 * 60 * 60 * 1000),
  );
  const filedLabel = t("safety:myReports.filedTemplate", {
    time: fmt.relativeTime(daysAgo, "day"),
  });
  // Closing the loop: a report that has been dealt with says so on the row
  // itself, so a member who missed or cleared the `report_resolved` bell
  // notification can still see for themselves that it was answered. An
  // absolute date, not "3 days ago" — the filing date already carries the
  // elapsed-time reading, and two relative times on one row read as noise.
  const resolvedLabel = report.resolvedAt
    ? t("safety:myReports.closedTemplate", {
        date: fmt.date(Date.parse(report.resolvedAt)),
      })
    : null;
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
          {resolvedLabel && (
            <>
              <span aria-hidden>·</span>
              <span>{resolvedLabel}</span>
            </>
          )}
        </div>
      </div>
      <Badge tone={REPORT_STATUS_TONE[report.status] ?? "ghost"}>
        {statusLabelKey ? t(statusLabelKey) : report.status}
      </Badge>
    </div>
  );
}
