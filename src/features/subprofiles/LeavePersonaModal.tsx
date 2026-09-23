import { useNavigate } from "react-router-dom";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { reasonFor } from "../../shared/api/errorMessage";
import { useSubprofileMembers } from "./api/useSubprofileMembers";

/**
 * "Leave this persona?" confirm: the signed-in member's own exit from a shared
 * persona (`DELETE /subprofiles/:id/members/me`, demo/live branched inside
 * `useSubprofileMembers`).
 *
 * The ONE implementation of Leave, mounted from three places: the co-owners
 * pane, where it has always lived; and the two danger surfaces a co-owner
 * reaches looking for Delete (the dashboard card and the editor's Publish
 * pane), where Delete is not theirs to use. A second copy of this flow would
 * drift from the first the moment the backend's rule changed.
 *
 * When the signed-in member is this persona's CREATOR, leaving doesn't just
 * drop their own access: the backend transfers creator status to the
 * longest-standing remaining ACTIVE co-owner (`pickSuccessorWithin`), falling
 * back to the longest-standing member overall only if no one remaining is
 * active. `MemberDTO` carries no account-status field, so the frontend cannot
 * always predict which member that will be. The body copy switches to a
 * variant that says the persona passes to whoever's been here longest,
 * without naming a specific person: naming one here could show the wrong
 * name whenever the real longest-standing co-owner turns out to be suspended
 * or deactivated.
 *
 * Deliberately no type-to-confirm: leaving takes nothing away from anyone else
 * and the member can be invited back, so the friction Delete needs would only
 * read as a scolding here.
 */
export function LeavePersonaModal({
  subprofileId,
  onClose,
}: {
  subprofileId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: members, leave } = useSubprofileMembers(subprofileId);

  const viewerSlug = user?.profile.slug;
  const memberList = members ?? [];
  const isViewerCreator = memberList.some(
    (member) => member.isCreator && member.slug === viewerSlug,
  );

  async function handleLeave() {
    try {
      await leave.mutateAsync();
      onClose();
      showToast(t("subprofiles:owners.toastLeft"), "info");
      void navigate(routes.subprofilesDashboard);
    } catch (error) {
      showToast(
        reasonFor(error) ?? t("subprofiles:owners.toastLeaveError"),
        "error",
      );
    }
  }

  return (
    <Modal
      title={t("subprofiles:owners.leaveModalTitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("subprofiles:owners.leaveModalKeep")}
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleLeave()}
            disabled={leave.isPending}
          >
            {leave.isPending
              ? t("subprofiles:owners.leaveModalLeaving")
              : t("subprofiles:owners.leaveModalConfirm")}
          </Button>
        </>
      }
    >
      <p>
        {isViewerCreator
          ? t("subprofiles:owners.leaveModalBodyCreator")
          : t("subprofiles:owners.leaveModalBody")}
      </p>
    </Modal>
  );
}
