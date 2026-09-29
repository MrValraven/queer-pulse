import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminDrawer } from "./ui";
import { type ModReport } from "./adminModeration.data";
import { useModReportDetail } from "./api/useModReportDetail";
import {
  ReportAudit,
  ReportContext,
  ReportContextFallback,
  ReportContextLoading,
} from "./AdminReportDrawerContext";
import {
  ReportDrawerActionGrid,
  ReportDrawerReasonNote,
} from "./AdminReportDrawerDecision";
import { AdminReportDrawerHead } from "./AdminReportDrawerHead";
import { ReportedPhotoEvidence } from "./AdminReportPhotoEvidence";
import {
  MIN_MEMBER_FACING_NOTE_LENGTH,
  modActionCodeFor,
} from "./reportDrawerOptions";
import { useAdminReportDrawerActions } from "./useAdminReportDrawerActions";
import type { ResolveOpts } from "./useModerationQueue";
import styles from "./AdminModerationPage.module.css";

export function AdminReportDrawer({
  report,
  onClose,
  onResolve,
  currentUserId,
  onAssignToMe,
  onUnassign,
}: {
  report: ModReport;
  onClose: () => void;
  /** Called when a report leaves the open queue (confirm or escalate). */
  onResolve: (id: string, opts?: ResolveOpts) => void;
  /** The signed-in moderator's id, for "is this assigned to ME" (COM-5). */
  currentUserId?: string;
  onAssignToMe?: (r: ModReport) => void;
  onUnassign?: (r: ModReport) => void;
}) {
  const { t } = useTranslation();
  const { detail, loading } = useModReportDetail(report);
  const {
    action,
    setAction,
    reason,
    setReason,
    note,
    setNote,
    restrictDuration,
    setRestrictDuration,
    confirmBlockedNoticeId,
    isMemberNoteMissing,
    trimmedNoteLength,
    isConfirmBlocked,
    handleConfirm,
    handleEscalate,
  } = useAdminReportDrawerActions({ report, onResolve, onClose });

  return (
    <AdminDrawer
      label={t("admin:moderation.reportDrawer.label", { title: report.title })}
      onClose={onClose}
      head={
        <AdminReportDrawerHead
          report={report}
          currentUserId={currentUserId}
          onAssignToMe={onAssignToMe}
          onUnassign={onUnassign}
        />
      }
      foot={
        <div className={styles.dFoot}>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:moderation.reportDrawer.cancelCta")}
          </Button>
          <Button variant="jade" onClick={handleEscalate}>
            {t("admin:moderation.reportDrawer.escalateCta")}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isConfirmBlocked}
            aria-describedby={
              isConfirmBlocked ? confirmBlockedNoticeId : undefined
            }
          >
            {t("admin:moderation.reportDrawer.confirmCta")}
          </Button>
        </div>
      }
    >
      {loading ? (
        <ReportContextLoading />
      ) : detail ? (
        <>
          {/* FIRST, above the written context, and only on an `event_photo`
              report. Every other subject is text, so the excerpt block below is
              the thing being judged; here the image IS the report, and `outing`
              and `doxxing` carry a one-hour SLA. Making a moderator scroll past
              an author byline and an empty thread block to reach the evidence
              would be the wrong reading order for the reports that matter most.
              Renders nothing at all when the report carries no photo snapshot,
              so a queue of text reports pays neither the markup nor a request. */}
          {detail.reportedPhoto && (
            <ReportedPhotoEvidence
              reportId={report.id}
              photo={detail.reportedPhoto}
            />
          )}
          <ReportContext detail={detail} report={report} />
        </>
      ) : (
        <ReportContextFallback report={report} />
      )}

      <ReportDrawerActionGrid
        action={action}
        onSelectAction={setAction}
        subjectType={report.subjectType}
        restrictDuration={restrictDuration}
        onRestrictDurationChange={setRestrictDuration}
      />

      <ReportDrawerReasonNote
        reason={reason}
        onReasonChange={setReason}
        note={note}
        onNoteChange={setNote}
        reportedName={report.reportedName}
        actionCode={modActionCodeFor(action)}
        communityName={report.community ?? null}
      />

      {/* Why Confirm is unavailable, in the reading order, directly under the
          note it is asking for. A greyed button with no sentence beside it is
          the same failure in a smaller form: the moderator is told no and not
          told what to do about it. Kept visible (rather than announced only on
          the button, which is unreachable while disabled) so it is readable by
          anyone at any point. */}
      {isConfirmBlocked && (
        <p className={styles.dTransparency} id={confirmBlockedNoticeId}>
          <FiAlertCircle aria-hidden />{" "}
          {isMemberNoteMissing
            ? t("admin:moderation.reportDrawer.noteRequiredNotice", {
                min: MIN_MEMBER_FACING_NOTE_LENGTH,
                current: trimmedNoteLength,
              })
            : t("admin:moderation.reportDrawer.pickActionNotice")}
        </p>
      )}

      <ReportAudit reportId={report.id} />
    </AdminDrawer>
  );
}
