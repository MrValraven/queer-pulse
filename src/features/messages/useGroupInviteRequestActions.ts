import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useGroupInvites } from "./api/useGroupInvites";
import {
  useAcceptGroupInvite,
  useDeclineGroupInvite,
} from "./api/useGroupManagementMutations";
import { groupErrorMessage } from "./api/groupErrorMessages";
import type { GroupInviteSummary } from "../../shared/contracts/contracts";

/**
 * PRD-353: the Requests tab's group-invite Accept/Decline behaviour, split out
 * of `MessagesRequestsPanel` to keep that component under the repo's 200-line
 * guidance. Both mutations remove the answered invite from `useGroupInvites`'s
 * own cache themselves (demo included), so this hook does no local list
 * bookkeeping of its own: it only owns the busy-row flag, the demo-only
 * toast (there is nothing else to tell the member the action "worked" in
 * demo, since there is no server round-trip to feel), and, on success,
 * opening the freshly-joined thread.
 */
export function useGroupInviteRequestActions() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const query = useGroupInvites();
  const acceptInvite = useAcceptGroupInvite();
  const declineInvite = useDeclineGroupInvite();
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);

  async function handleAccept(invite: GroupInviteSummary) {
    setBusyInviteId(invite.id);
    try {
      const joined = await acceptInvite.mutateAsync(invite.id);
      if (demoMode) {
        showToast(t("messages:requests.groupInvite.acceptedDemo"), "info");
      } else if (joined) {
        // Opens the freshly-joined thread the same way a notification tap
        // does (`?c=<id>`, honoured by `MessagesThreadList`'s deep-link effect).
        void navigate(`${routes.messages}?c=${encodeURIComponent(joined.id)}`);
      }
    } catch (error) {
      showToast(
        groupErrorMessage(error, t, t("messages:group.error.generic")),
        "error",
      );
    } finally {
      setBusyInviteId(null);
    }
  }

  async function handleDecline(invite: GroupInviteSummary) {
    setBusyInviteId(invite.id);
    try {
      await declineInvite.mutateAsync(invite.id);
      if (demoMode) {
        showToast(t("messages:requests.groupInvite.declined"), "info");
      }
    } catch (error) {
      showToast(
        groupErrorMessage(error, t, t("messages:group.error.generic")),
        "error",
      );
    } finally {
      setBusyInviteId(null);
    }
  }

  return {
    invites: query.data ?? [],
    isLoading: query.isLoading,
    busyInviteId,
    handleAccept,
    handleDecline,
  };
}
