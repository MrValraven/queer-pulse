import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSetCardHolderStatus } from "./api/useCardHolders";
import type { IssuerCardDTO } from "./api/cards.api";

type NextStatus = "active" | "suspended" | "revoked";

const REASON_MIN_LENGTH = 3;
const REASON_MAX_LENGTH = 280;

/**
 * Suspend, revoke, or reinstate one holder's card.
 *
 * Suspend and revoke REQUIRE a reason (min 3 chars), matching the backend's
 * 400. The reason is issuer-only: it lands in this panel and the community's
 * own records, and it never appears on the holder's own card or on the public
 * verify page (see `cards:holders.reasonHint`). Cancel stays enabled the whole
 * time, so a short reason blocks only the confirm action, not the exit.
 */
export function CardHolderStatusModal({
  card,
  slug,
  nextStatus,
  onClose,
}: {
  card: IssuerCardDTO;
  slug: string;
  nextStatus: NextStatus;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const setStatus = useSetCardHolderStatus(slug);
  const [reason, setReason] = useState("");

  const needsReason = nextStatus !== "active";
  const canSubmit = !needsReason || reason.trim().length >= REASON_MIN_LENGTH;

  const submit = () => {
    if (!canSubmit || setStatus.isPending) return;
    setStatus.mutate(
      {
        cardId: card.id,
        status: nextStatus,
        reason: needsReason ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          showToast(
            t(`cards:holders.toast.${nextStatus}`, { name: card.holderName }),
          );
          onClose();
        },
        onError: () => {
          showToast(t("common:toast.saveFailed"), "error");
        },
      },
    );
  };

  return (
    <Modal
      title={t(`cards:holders.modal.${nextStatus}`, { name: card.holderName })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={setStatus.isPending}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button
            variant={nextStatus === "active" ? "primary" : "danger"}
            onClick={submit}
            disabled={!canSubmit || setStatus.isPending}
          >
            {t(`cards:holders.confirm.${nextStatus}`)}
          </Button>
        </>
      }
    >
      {needsReason ? (
        <FormField
          label={t("cards:holders.reasonLabel")}
          required
          helper={t("cards:holders.reasonHint")}
        >
          <textarea
            value={reason}
            maxLength={REASON_MAX_LENGTH}
            rows={3}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("cards:holders.reasonPlaceholder")}
          />
        </FormField>
      ) : null}
    </Modal>
  );
}
