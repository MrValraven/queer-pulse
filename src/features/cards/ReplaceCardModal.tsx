import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { IssuerCardDTO } from "./api/cards.api";

/**
 * Confirms voiding the printed copies of one card.
 *
 * Its own modal rather than a fourth branch of `CardHolderStatusModal`,
 * because this changes no status and takes no reason. The copy is explicit
 * about the split outcome: the paper dies, the phone keeps working. A mod
 * reaching for this has usually just been told a wallet was lost, and the one
 * thing they need to know is that they are not cutting the member off.
 */
export function ReplaceCardModal({
  holder,
  isPending,
  onConfirm,
  onClose,
}: {
  holder: IssuerCardDTO;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("cards:holders.replaceModal.title", { name: holder.holderName })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {t("cards:holders.replaceModal.cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isPending}>
            {t("cards:holders.replaceModal.confirm")}
          </Button>
        </>
      }
    >
      <p>{t("cards:holders.replaceModal.body")}</p>
    </Modal>
  );
}
