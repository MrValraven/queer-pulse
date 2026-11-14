import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type {
  LeadListItemDTO,
  LeadStage,
  UpdateLeadBody,
} from "./api/leads.types";
import { useLeadIsWriting, useQuickUpdateLead } from "./api/useLeadMutations";
import { leadErrorKeyOf, leadErrorValuesOf } from "./leadErrors";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import type { LeadQuickActions } from "./leadQuickActions";
import { useHeldStageMoves } from "./useHeldStageMoves";
import {
  LEAD_FOLLOW_UP_DATE_OPTIONS,
  LEAD_UNDO_TOAST_MS,
} from "./leadsList.data";

/**
 * Stage and follow-up changes straight from the list, each with a toast
 * that offers Undo. A stage move shows at once but is saved only when the
 * Undo window ends (see `useHeldStageMoves`), because the history logs
 * every saved stage change. A follow-up change logs nothing, so it saves at
 * once and its Undo sends the old date back. A refusal names its reason in
 * an error toast. While any lead write is in flight a new pick is ignored,
 * as on the lead page, so two writes never race.
 */
export function useLeadQuickActions(): LeadQuickActions {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const quickUpdate = useQuickUpdateLead();
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

  const save = (
    leadId: string,
    body: UpdateLeadBody,
    title: string,
    undoBody: UpdateLeadBody,
  ) => {
    if (isWriting) return;
    const undo = () =>
      quickUpdate.mutate(
        { leadId, body: undoBody },
        {
          onSuccess: () => showToast(t("admin:leads.quick.undone"), "info"),
          onError: showRefusal,
        },
      );
    quickUpdate.mutate(
      { leadId, body },
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

  // A stage move is held for the Undo window and saved after it, so Undo
  // writes nothing and the history keeps one line per real change.
  const heldMoves = useHeldStageMoves({
    save: (move) =>
      quickUpdate
        .mutateAsync({ leadId: move.leadId, body: { stage: move.stage } })
        .catch((cause: unknown) => {
          showRefusal(cause);
          throw cause;
        }),
  });

  const moveToStage = (row: LeadListItemDTO, stage: LeadStage) => {
    if (stage === row.stage || isWriting) return;
    const move = heldMoves.hold(
      row.id,
      { stage: row.stage, followUpOn: row.followUpOn },
      stage,
    );
    if (move === null) return;
    const undo = () => {
      if (heldMoves.drop(move)) {
        showToast(t("admin:leads.quick.undone"), "info");
        return;
      }
      // The toast was held open past the window, so the move was already
      // sent: only a second change can take it back.
      quickUpdate.mutate(
        { leadId: row.id, body: { stage: move.from.stage } },
        {
          onSuccess: () => showToast(t("admin:leads.quick.undone"), "info"),
          onError: showRefusal,
        },
      );
    };
    showToast(
      t("admin:leads.quick.movedToast", {
        name: row.name,
        stage: t(LEAD_STAGE_LABEL_KEY[stage]),
      }),
      "success",
      LEAD_UNDO_TOAST_MS,
      { label: t("admin:leads.quick.undo"), onClick: undo },
    );
  };

  const setFollowUp = (row: LeadListItemDTO, day: string | null) => {
    if (day === row.followUpOn) return;
    const title =
      day === null
        ? t("admin:leads.quick.followUpClearedToast", { name: row.name })
        : t("admin:leads.quick.followUpSetToast", {
            name: row.name,
            date: formatDate(day, language, LEAD_FOLLOW_UP_DATE_OPTIONS),
          });
    save(row.id, { followUpOn: day }, title, { followUpOn: row.followUpOn });
  };

  const pendingFor = (leadId: string): UpdateLeadBody | null =>
    quickUpdate.isPending && quickUpdate.variables?.leadId === leadId
      ? quickUpdate.variables.body
      : null;

  return { moveToStage, setFollowUp, pendingFor, isWriting };
}
