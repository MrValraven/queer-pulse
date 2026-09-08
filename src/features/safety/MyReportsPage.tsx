import { FiFlag } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useMyReports } from "./api/useMyReports";
import { MyReportRow } from "./MyReportRow";
import styles from "./MyReportsPage.module.css";

/** Loading placeholder mirroring a report row's two lines plus its status pill. */
function ReportRowSkeleton() {
  return (
    <div className={styles.rowSkeleton} aria-hidden>
      <div className={styles.rowSkeletonText}>
        <SkeletonLine width="38%" height={15} />
        <SkeletonLine width="55%" height={12} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine width={72} height={24} style={{ borderRadius: 999 }} />
    </div>
  );
}

/**
 * `/account/reports` — the member's own record of every report they have
 * filed: what they reported it for, the reference code to quote back, when it
 * was filed, and where it stands.
 *
 * A RECEIPT LIST, never a moderation queue. It shows the member only their own
 * filings, and of each filing only the half that is theirs: it never shows the
 * reported content, who was reported, the moderator's reasoning, or what was
 * done to anyone (that boundary is drawn on the server, in
 * `ReportsController.listMine`, and mirrored here).
 *
 * Reached from the `report_received` bell notification, the account menu, the
 * `/safety` hub and the report form itself. The "Who sees what" profile sheet
 * keeps a summary of the same list, and links here.
 */
export function MyReportsPage() {
  const { t } = useTranslation();
  const { data: reports, isLoading, isError, refetch } = useMyReports();
  const hasReports = (reports?.length ?? 0) > 0;

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.headText}>
            <div className={styles.eyebrow}>
              {t("safety:myReports.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="safety:myReports.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.lead}>{t("safety:myReports.lead")}</p>
          </div>
          <Button to={routes.report} variant="ghost">
            {t("safety:myReports.fileCta")}
          </Button>
        </header>

        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <ReportRowSkeleton key={index} />
          ))}

        {isError && (
          <div className={styles.errorBlock} role="alert">
            <p className={styles.errorText}>{t("safety:myReports.error")}</p>
            {/* A member checking whether their report was answered must be
                able to try again rather than be left reading "we couldn't load
                them" as "you filed none". Same reasoning as `useMyAppeals`. */}
            <Button variant="ghost" onClick={() => void refetch()}>
              {t("safety:myReports.retry")}
            </Button>
          </div>
        )}

        {!isLoading && !isError && !hasReports && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <FiFlag aria-hidden />
            </div>
            <p className={styles.emptyTitle}>{t("safety:myReports.empty")}</p>
            <p className={styles.emptyNote}>
              {t("safety:myReports.emptySignedOutNote")}
            </p>
          </div>
        )}

        {!isLoading && hasReports && (
          <>
            <div className={styles.list}>
              {reports?.map((report, index) => (
                <FadeIn key={report.id} delay={Math.min(index, 8) * 55}>
                  <MyReportRow report={report} />
                </FadeIn>
              ))}
            </div>
            <p className={styles.footNote}>{t("safety:myReports.footNote")}</p>
          </>
        )}
      </div>
    </AppShell>
  );
}
