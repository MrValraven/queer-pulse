import { useState } from "react";
import { FiFlag, FiExternalLink } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { describeError } from "../../shared/api/errorMessage";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
import type { ModReport } from "../communities/community.model";
import { useCommunityReports } from "../communities/api/useCommunityReports";
import { useCommunityTime } from "../communities/communityTime";
import {
  useDeleteCommunityPost,
  useDismissCommunityReport,
} from "../communities/api/useCommunityMutations";
import styles from "./ModPanel.module.css";

/**
 * The mod panel's Reports tab. Rows come from `useCommunityReports(slug)`, the
 * same source `communities/ModToolsTab` uses: live reads the owner/mod-only
 * `GET /communities/:slug/reports`, demo reads the flagship's mock queue. The
 * old `living.reports` snapshot is gone: live hard-codes that array to `[]`
 * (`communities.adapters.ts`), so the tab was permanently empty there.
 *
 * Only two of the four former actions have an endpoint a COMMUNITY owner/mod is
 * authorized for, so only those two are rendered:
 *  - "Remove post" tombstones the post (`DELETE /communities/:slug/posts/:id`)
 *    and then closes the report (`PATCH /mod/reports/:id` with `dismiss`, which
 *    the backend's community-owner/mod carve-out allows).
 *  - "Dismiss" closes the report and leaves the post up.
 * `warn` and `escalate` on `PATCH /mod/reports/:id` require a PLATFORM
 * Moderator/Admin role, so they are no longer offered as buttons here. A viewer
 * who does hold that role gets a real deep link into the platform queue, where
 * those actions come with the mandatory reason code and member-facing note.
 */
export function ReportsTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { role } = useAuth();
  const incoming = useCommunityReports(slug);
  const deletePost = useDeleteCommunityPost(slug);
  const dismissReport = useDismissCommunityReport(slug);
  // Which rows this moderator has actioned in this session. Kept as ids rather
  // than a snapshot of the list, so a live refetch (or a queue that arrives
  // after first render) still flows through while resolved rows stay hidden.
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const reports = incoming.items.filter(
    (report) => !resolvedIds.includes(report.id),
  );
  const isPlatformModerator = role === "moderator" || role === "admin";

  const hideRow = (id: string) => setResolvedIds((prev) => [...prev, id]);
  const restoreRow = (id: string) =>
    setResolvedIds((prev) => prev.filter((resolved) => resolved !== id));

  // `useDismissCommunityReport` carries no `meta.silentError`, so the app-wide
  // MutationCache handler already toasts its failure reason. Toasting again here
  // would double up, hence the error path only puts the row back.
  const closeReport = (
    report: ModReport,
    toastKey: string,
    tone: "success" | "info",
  ) => {
    dismissReport.mutate(
      { id: report.id },
      {
        onSuccess: () => showToast(t(toastKey), tone),
        onError: () => restoreRow(report.id),
      },
    );
  };

  const removeReportedPost = (report: ModReport) => {
    hideRow(report.id);
    deletePost.mutate(
      { id: report.subjectId ?? "" },
      {
        onSuccess: () =>
          closeReport(report, "admin:modPanel.reports.removedToast", "success"),
        onError: (error) => {
          restoreRow(report.id);
          showToast(
            describeError(t("admin:modPanel.reports.removeErrorToast"), error),
            "error",
          );
        },
      },
    );
  };

  const dismissRow = (report: ModReport) => {
    hideRow(report.id);
    closeReport(report, "admin:modPanel.reports.dismissedToast", "info");
  };

  return (
    <div>
      <div className={styles.secLbl}>
        {t("admin:modPanel.reports.sectionLabel")}{" "}
        {reports.length > 0 && (
          <span className={styles.tabCount}>{reports.length}</span>
        )}
      </div>
      {reports.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:modPanel.reports.emptyTitle")}
          description={t("admin:modPanel.reports.emptyDesc")}
        />
      ) : (
        <>
          <p className={styles.modMeta}>
            {t("admin:modPanel.reports.escalationNote")}
          </p>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              canRemove={
                (report.subjectType == null || report.subjectType === "post") &&
                (demoMode || Boolean(report.subjectId))
              }
              isPlatformModerator={isPlatformModerator}
              onRemove={() => removeReportedPost(report)}
              onDismiss={() => dismissRow(report)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function ReportCard({
  report,
  canRemove,
  isPlatformModerator,
  onRemove,
  onDismiss,
}: {
  report: ModReport;
  canRemove: boolean;
  isPlatformModerator: boolean;
  onRemove: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  // Live rows carry an ISO `createdAt`; demo mocks carry the legacy
  // pre-rendered `time` token. `ago` resolves whichever is present, so this
  // row no longer prints an empty age against a real report.
  const reportedAgo = useCommunityTime().ago(report);
  // Demo mocks author a free-text `reason`; live rows carry only the stable
  // `reasonCode` (the leaner backend shape), resolved to a label here.
  const reasonLabel =
    report.reason ??
    (report.reasonCode ? t(REASON_LABEL_KEYS[report.reasonCode]) : "");
  const queueHref = report.subjectId
    ? `${routes.adminModeration}?tab=open&subjectId=${encodeURIComponent(report.subjectId)}`
    : routes.adminModeration;

  return (
    <div className={styles.reportCard}>
      <div className={styles.reportReason}>
        <FiFlag aria-hidden /> {reasonLabel}
      </div>
      {report.postExcerpt && (
        <p className={styles.reportExcerpt}>“{report.postExcerpt}”</p>
      )}
      <div className={styles.modMeta}>
        {report.author && report.reporter
          ? t("admin:modPanel.reports.metaLine", {
              author: report.author.name,
              reporter: report.reporter.name,
              time: reportedAgo,
            })
          : t("admin:modPanel.reports.metaLiveLine", { time: reportedAgo })}
      </div>
      {!canRemove && (
        <p className={styles.modMeta}>
          {t("admin:modPanel.reports.replyNote")}
        </p>
      )}
      <div className={styles.modActions} style={{ marginTop: 12 }}>
        {canRemove && (
          <Button variant="primary" onClick={onRemove}>
            {t("admin:modPanel.reports.removeCta")}
          </Button>
        )}
        <Button variant="ghost" onClick={onDismiss}>
          {t("admin:modPanel.reports.dismissCta")}
        </Button>
        {isPlatformModerator && (
          <Button variant="ghost" to={queueHref}>
            <FiExternalLink aria-hidden />{" "}
            {t("admin:modPanel.reports.openInQueueCta")}
          </Button>
        )}
      </div>
    </div>
  );
}
