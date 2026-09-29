import { useId, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { modActionsFor, type ModReport } from "./adminModeration.data";
import {
  DEFAULT_RESTRICT_DURATION,
  MIN_MEMBER_FACING_NOTE_LENGTH,
  isMemberFacingModAction,
  modActionCodeFor,
} from "./reportDrawerOptions";
import type { ReasonCode } from "../safety/reportReasons";
import type { ResolveOpts } from "./useModerationQueue";

/**
 * The report drawer's decision state and its two exits (confirm / escalate).
 *
 * PRD-287: a decision that lands on a member may not be filed with a blank
 * reason. The member is told "you were restricted for 7 days" and the note
 * is the only sentence explaining why, so an empty one leaves their appeal
 * with nothing to answer. The backend now refuses it; this stops the
 * moderator BEFORE the request, while the words are still in front of them,
 * and says which decisions the rule covers rather than greying a button out
 * in silence. `dismiss` and `escalate` reach nobody and stay free of it.
 */
export function useAdminReportDrawerActions({
  report,
  onResolve,
  onClose,
}: {
  report: ModReport;
  onResolve: (id: string, opts?: ResolveOpts) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [action, setAction] = useState<string | null>(null);
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [note, setNote] = useState("");
  const [restrictDuration, setRestrictDuration] = useState<string>(
    DEFAULT_RESTRICT_DURATION,
  );
  const confirmBlockedNoticeId = useId();
  const actions = modActionsFor(report.subjectType);

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
    const chosen = actions.find((candidate) => candidate.id === action);
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

  return {
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
  };
}
