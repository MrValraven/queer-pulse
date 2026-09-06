import { useId, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminDrawer, AdminChip, AdminCat } from "./ui";
import {
  SEVERITY,
  chipKey,
  chipLabel,
  modActionsFor,
  type ModReport,
} from "./adminModeration.data";
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
import { ReportedPhotoEvidence } from "./AdminReportPhotoEvidence";
import {
  DEFAULT_RESTRICT_DURATION,
  MIN_MEMBER_FACING_NOTE_LENGTH,
  isMemberFacingModAction,
  modActionCodeFor,
} from "./reportDrawerOptions";
import type { ReasonCode } from "../safety/reportReasons";
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
  const { showToast } = useToast();
  const [action, setAction] = useState<string | null>(null);
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [note, setNote] = useState("");
  const [restrictDuration, setRestrictDuration] = useState<string>(
    DEFAULT_RESTRICT_DURATION,
  );
  const { detail, loading } = useModReportDetail(report);
  const confirmBlockedNoticeId = useId();

  const sev = SEVERITY[report.severity];
  const actions = modActionsFor(report.subjectType);

  // PRD-287: a decision that lands on a member may not be filed with a blank
  // reason. The member is told "you were restricted for 7 days" and the note
  // is the only sentence explaining why, so an empty one leaves their appeal
  // with nothing to answer. The backend now refuses it; this stops the
  // moderator BEFORE the request, while the words are still in front of them,
  // and says which decisions the rule covers rather than greying a button out
  // in silence. `dismiss` and `escalate` reach nobody and stay free of it.
  const isMemberFacingAction = isMemberFacingModAction(
    modActionCodeFor(action),
  );
  const trimmedNoteLength = note.trim().length;
  const isMemberNoteMissing =
    isMemberFacingAction && trimmedNoteLength < MIN_MEMBER_FACING_NOTE_LENGTH;
  const isConfirmBlocked = !action || isMemberNoteMissing;

  const handleConfirm = () => {
    if (!action) {
      showToast(t("admin:moderation.reportDrawer.pickActionToast"), "error");
      return;
    }
    if (isMemberNoteMissing) {
      showToast(
        t("admin:moderation.reportDrawer.noteRequiredToast", {
          min: MIN_MEMBER_FACING_NOTE_LENGTH,
        }),
        "error",
      );
      return;
    }
    const chosen = actions.find((a) => a.id === action);
    onResolve(report.id, {
      verb: "resolved",
      action,
      reasonCode: reason ?? "other",
      note,
      duration: action === "restrict" ? restrictDuration : undefined,
    });
    showToast(
      t("admin:moderation.reportDrawer.confirmedToast", {
        name: report.reportedName,
        verb: chosen
          ? t(chosen.doneKey)
          : t("admin:moderation.actions.actionedFallback"),
      }),
      "success",
    );
    onClose();
  };

  const handleEscalate = () => {
    onResolve(report.id, {
      verb: "escalated",
      action: "escalate",
      reasonCode: reason ?? "other",
      note,
    });
    showToast(t("admin:moderation.reportDrawer.escalatedToast"), "success");
    onClose();
  };

  return (
    <AdminDrawer
      label={t("admin:moderation.reportDrawer.label", { title: report.title })}
      onClose={onClose}
      head={
        <>
          <div className={styles.dHeadChips}>
            <AdminCat tone={sev.category}>{t(sev.labelKey)}</AdminCat>
            {report.chips.map((chip) => (
              <AdminChip key={chipKey(chip)} tone={chip.tone}>
                {chipLabel(chip, t)}
              </AdminChip>
            ))}
          </div>
          <h2 className={styles.dTitle}>
            {t("admin:moderation.reportDrawer.title")}
          </h2>
          {(onAssignToMe || onUnassign) && (
            <div className={styles.dAssignment}>
              <span>
                {report.assignedModeratorId
                  ? report.assignedModeratorId === currentUserId
                    ? t("admin:moderation.reportDrawer.assignedToYou")
                    : t("admin:moderation.reportDrawer.assignedTo", {
                        name:
                          report.assignedModeratorName ??
                          t("admin:moderation.reportDrawer.anotherModerator"),
                      })
                  : t("admin:moderation.reportDrawer.unassigned")}
              </span>
              {report.assignedModeratorId === currentUserId && onUnassign ? (
                <button
                  type="button"
                  className={styles.dAssignmentCta}
                  onClick={() => onUnassign(report)}
                >
                  {t("admin:moderation.reportDrawer.unassignCta")}
                </button>
              ) : !report.assignedModeratorId && onAssignToMe ? (
                <button
                  type="button"
                  className={styles.dAssignmentCta}
                  onClick={() => onAssignToMe(report)}
                >
                  {t("admin:moderation.reportDrawer.assignToMeCta")}
                </button>
              ) : null}
            </div>
          )}
        </>
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
          <ReportContext detail={detail} subjectType={report.subjectType} />
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
