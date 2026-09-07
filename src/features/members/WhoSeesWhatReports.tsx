import { Link } from "react-router-dom";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MyReportRow } from "../safety/MyReportRow";
import { useMyReports } from "../safety/api/useMyReports";
import styles from "./WhoSeesWhatSheet.module.css";

/** Read-only receipt list of reports this member has filed themselves — not a
 *  moderation queue (that's `admin/AdminModerationPage.tsx`; this member sees
 *  only their own filings, never the reported content or mod actions).
 *
 *  A SUMMARY of the full record: the rows are the same `MyReportRow` the
 *  standalone `/account/reports` page renders, and the link at the foot goes
 *  there. This section predates that page and stays because a member reviewing
 *  what the platform knows about them should meet their own filings here too,
 *  but the page is where the list belongs. */
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
            <MyReportRow key={report.id} report={report} />
          ))}
        </div>
      )}

      <Link to={routes.myReports} className={styles.reportsAllLink}>
        {t("members:profile.whoSeesWhat.reports.viewAll")}
      </Link>
    </section>
  );
}
