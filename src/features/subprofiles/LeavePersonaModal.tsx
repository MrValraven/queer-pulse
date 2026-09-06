import { useNavigate } from "react-router-dom";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { leave } = useSubprofileMembers(subprofileId);

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
      <p>{t("subprofiles:owners.leaveModalBody")}</p>
    </Modal>
  );
}
