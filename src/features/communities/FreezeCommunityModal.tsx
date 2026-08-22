import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFreezeCommunity } from "./api/useCommunityMutations";

/**
 * Confirm step for the danger zone's "Freeze this community" action — a real,
 * mod-visible change (blocks new posts/joins), so it never fires straight off
 * the row button. Mirrors `LeaveCommunityModal`'s confirm-modal pattern.
 */
export function FreezeCommunityModal({
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
  const freeze = useFreezeCommunity();

  const onConfirm = () => {
    freeze.mutate(
      { slug },
      {
        onSuccess: () => {
          showToast(
            t("communities:detail.dangerZone.freeze.successToast", { name }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(t("communities:detail.dangerZone.errorToast"), "error"),
      },
    );
  };

  return (
    <Modal
      title={t("communities:detail.dangerZone.freeze.confirm.title", { name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={freeze.isPending}>
            {t("communities:detail.dangerZone.freeze.confirm.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={freeze.isPending}
          >
            {t("communities:detail.dangerZone.freeze.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("communities:detail.dangerZone.freeze.confirm.body", { name })}</p>
    </Modal>
  );
}
