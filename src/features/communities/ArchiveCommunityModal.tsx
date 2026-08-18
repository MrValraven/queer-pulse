import { useNavigate } from "react-router-dom";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useArchiveCommunity } from "./api/useCommunityMutations";

/**
 * Confirm step for the danger zone's "Archive this community" action —
 * owner-only, and one-way (there's no unarchive endpoint anywhere in this
 * codebase), so the copy says so plainly. Mirrors `LeaveCommunityModal`'s
 * confirm-modal pattern. On success there's nothing left to manage here, so
 * it sends the owner back to the communities list.
 */
export function ArchiveCommunityModal({
  slug,
  name,
  onClose,
}: {
  slug: string;
  name: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const archive = useArchiveCommunity();

  const onConfirm = () => {
    archive.mutate(
      { slug },
      {
        onSuccess: () => {
          showToast(
            t("communities:detail.dangerZone.archive.successToast", { name }),
            "success",
          );
          onClose();
          void navigate(routes.communities);
        },
        onError: () =>
          showToast(t("communities:detail.dangerZone.errorToast"), "error"),
      },
    );
  };

  return (
    <Modal
      title={t("communities:detail.dangerZone.archive.confirm.title", { name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={archive.isPending}>
            {t("communities:detail.dangerZone.archive.confirm.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={archive.isPending}>
            {t("communities:detail.dangerZone.archive.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("communities:detail.dangerZone.archive.confirm.body", { name })}</p>
    </Modal>
  );
}
