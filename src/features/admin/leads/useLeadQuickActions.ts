import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type {
  LeadDTO,
  LeadEntryDTO,
  LeadListItemDTO,
  LeadStage,
  UpdateLeadBody,
} from "./api/leads.types";
import {
  useLeadIsWriting,
  useQuickUpdateLead,
  useRevertLeadStageChange,
} from "./api/useLeadMutations";
import { leadErrorKeyOf, leadErrorValuesOf } from "./leadErrors";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import type { LeadQuickActions } from "./leadQuickActions";
import {
  LEAD_FOLLOW_UP_DATE_OPTIONS,
  LEAD_UNDO_TOAST_MS,
} from "./leadsList.data";

/** History order: the newest stamp first, then the higher id. */
function isNewerEntry(entry: LeadEntryDTO, other: LeadEntryDTO): boolean {
  const gapMs = Date.parse(entry.createdAt) - Date.parse(other.createdAt);
  return gapMs === 0 ? entry.id > other.id : gapMs > 0;
}

/** The stage change line a move from `fromStage` to `toStage` wrote: the
 *  newest `stage_changed` line of the answer, when it records that move.
 *  Null when the move changed nothing, so there is nothing to take back. */
function stageChangeEntryOf(
  lead: LeadDTO,
  fromStage: LeadStage,
  toStage: LeadStage,
): LeadEntryDTO | null {
  const newestStageChange = lead.entries
    .filter((entry) => entry.kind === "stage_changed")
    .reduce<LeadEntryDTO | null>(
      (newest, entry) =>
        newest === null || isNewerEntry(entry, newest) ? entry : newest,
      null,
    );
  const isThisMove =
    newestStageChange?.fromStage === fromStage &&
    newestStageChange.toStage === toStage;
  return isThisMove ? newestStageChange : null;
}

/**
 * Stage and follow-up changes straight from the list, each saved at once
 * with a toast that offers Undo. Undo of a stage move reverts its history
 * line on the server, so the stage goes back and the history keeps no
 * trace of the move. Undo of a follow-up change sends the old date back,
 * since a follow-up change writes no history line. A refusal names its
 * reason in an error toast. While any lead write is in flight a new pick is
 * ignored, as on the lead page, so two writes never race.
 */
export function useLeadQuickActions(): LeadQuickActions {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const quickUpdate = useQuickUpdateLead();
  const revert = useRevertLeadStageChange();
  const isWriting = useLeadIsWriting();

  const showRefusal = (cause: unknown) => {
    showToast(
      {
        title: t("admin:leads.quick.failed"),
        detail: t(leadErrorKeyOf(cause), leadErrorValuesOf(cause)),
      },
      "error",
    );
  };
  const showUndone = () => showToast(t("admin:leads.quick.undone"), "info");

  const moveToStage = (row: LeadListItemDTO, stage: LeadStage) => {
    if (stage === row.stage || isWriting) return;
    const title = t("admin:leads.quick.movedToast", {
      name: row.name,
      stage: t(LEAD_STAGE_LABEL_KEY[stage]),
    });
    quickUpdate.mutate(
      { leadId: row.id, body: { stage } },
      {
        onSuccess: (lead) => {
          const entry = stageChangeEntryOf(lead, row.stage, stage);
          if (entry === null) {
            showToast(title, "success");
            return;
          }
          const undo = () =>
            revert.mutate(
              { leadId: row.id, entryId: entry.id, fromStage: row.stage },
              { onSuccess: showUndone, onError: showRefusal },
            );
          showToast(title, "success", LEAD_UNDO_TOAST_MS, {
            label: t("admin:leads.quick.undo"),
            onClick: undo,
          });
        },
        onError: showRefusal,
      },
    );
  };

  const setFollowUp = (row: LeadListItemDTO, day: string | null) => {
    if (day === row.followUpOn || isWriting) return;
    const title =
      day === null
        ? t("admin:leads.quick.followUpClearedToast", { name: row.name })
        : t("admin:leads.quick.followUpSetToast", {
            name: row.name,
            date: formatDate(day, language, LEAD_FOLLOW_UP_DATE_OPTIONS),
          });
    const undo = () =>
      quickUpdate.mutate(
        { leadId: row.id, body: { followUpOn: row.followUpOn } },
        { onSuccess: showUndone, onError: showRefusal },
      );
    quickUpdate.mutate(
      { leadId: row.id, body: { followUpOn: day } },
      {
        onSuccess: () =>
          showToast(title, "success", LEAD_UNDO_TOAST_MS, {
            label: t("admin:leads.quick.undo"),
            onClick: undo,
          }),
        onError: showRefusal,
      },
    );
  };

  const pendingFor = (leadId: string): UpdateLeadBody | null => {
    if (quickUpdate.isPending && quickUpdate.variables?.leadId === leadId) {
      return quickUpdate.variables.body;
    }
    if (revert.isPending && revert.variables?.leadId === leadId) {
      return { stage: revert.variables.fromStage };
    }
    return null;
  };

  return { moveToStage, setFollowUp, pendingFor, isWriting };
}
