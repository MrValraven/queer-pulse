import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MemberSelectPerson } from "../../shared/components/ui";
import type { ToastType } from "../../shared/components/feedback/toastContext";
import { useToast } from "../../shared/components/feedback/useToast";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { UpdateRsvpDetailsDto } from "./api/events.api";
import { useUpdateRsvpDetails } from "./api/useEventMutations";
import {
  useSendRsvpInvites,
  type SendRsvpInvitesOutcome,
} from "./api/useMemberInviteMutations";
import {
  rsvpDetailsSaveErrorMessage,
  rsvpInviteSendErrorMessage,
} from "./rsvpErrors";

/** One toast per fact a send reported: sent, already invited, refused. */
function showSendOutcome(
  outcome: SendRsvpInvitesOutcome,
  t: TFunction,
  showToast: (message: string, type: ToastType) => void,
) {
  const { sentCount, alreadyInvitedCount, notInvitableCount } = outcome;
  if (sentCount > 0) {
    showToast(
      t("gatherings:rsvpInvites.sentToast", { count: sentCount }),
      "success",
    );
  }
  if (alreadyInvitedCount > 0) {
    showToast(
      t("gatherings:rsvpInvites.alreadyInvitedToast", {
        count: alreadyInvitedCount,
      }),
      "info",
    );
  }
  if (notInvitableCount > 0) {
    showToast(
      t("gatherings:rsvpInvites.notInvitableToast", {
        count: notInvitableCount,
      }),
      "warning",
    );
  }
}

/**
 * The RSVP details modal's one Save: the details first, then the picked
 * connections' invites, so a member never has two buttons to remember.
 *
 * A refused details save sends nothing. A refused send after a saved details
 * write keeps the modal open with its picks, so Save can simply be pressed
 * again; the details write repeats harmlessly. Demo mode has no details to
 * write and sends through the demo cache.
 */
export function useSaveRsvpWithInvites(slug: string, onClose: () => void) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const update = useUpdateRsvpDetails(slug);
  const sendInvites = useSendRsvpInvites(slug);

  const finish = () => {
    onClose();
    showToast(t("gatherings:rsvpDetails.savedToast"), "success");
  };

  const sendPicks = (picks: MemberSelectPerson[]) => {
    if (picks.length === 0) {
      finish();
      return;
    }
    sendInvites.mutate(picks, {
      onSuccess: (outcome) => {
        finish();
        showSendOutcome(outcome, t, showToast);
      },
      onError: (error) =>
        showToast(rsvpInviteSendErrorMessage(error, t), "error"),
    });
  };

  const save = (details: UpdateRsvpDetailsDto, picks: MemberSelectPerson[]) => {
    if (demoMode) {
      sendPicks(picks);
      return;
    }
    update.mutate(details, {
      onSuccess: () => sendPicks(picks),
      onError: (error) =>
        showToast(rsvpDetailsSaveErrorMessage(error, t), "error"),
    });
  };

  return { save, isSaving: update.isPending || sendInvites.isPending };
}
