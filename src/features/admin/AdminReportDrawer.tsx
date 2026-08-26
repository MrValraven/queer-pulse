import { useState } from "react";
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
import {
  DEFAULT_RESTRICT_DURATION,
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

  const sev = SEVERITY[report.severity];
  const actions = modActionsFor(report.subjectType);

  const handleConfirm = () => {
    if (!action) {
      showToast(t("admin:moderation.reportDrawer.pickActionToast"), "error");
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
          <Button variant="primary" onClick={handleConfirm}>
            {t("admin:moderation.reportDrawer.confirmCta")}
          </Button>
        </div>
      }
    >
      {loading ? (
        <ReportContextLoading />
      ) : detail ? (
        <ReportContext detail={detail} subjectType={report.subjectType} />
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

      <ReportAudit reportId={report.id} />
    </AdminDrawer>
  );
}
