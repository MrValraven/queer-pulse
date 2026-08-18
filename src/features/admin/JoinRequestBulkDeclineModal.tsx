import { useState } from "react";
import { Button, FormField, Modal, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DECLINE_REASONS,
  declineReasonLabelKey,
} from "../auth/api/joinRequestDeclineReason";

/**
 * The bulk sibling of `JoinRequestDeclineModal` (Task 1) — a SEPARATE
 * component rather than a shared one, same reasoning that already keeps
 * `VerificationBulkRejectModal` apart from the single-row verification
 * drawer's own reject confirm: the two call sites are free to evolve
 * independently (a bulk decline might eventually want a "these ids differ,
 * are you sure" warning a single decline never would).
 */
export function JoinRequestBulkDeclineModal({
  count,
  pending,
  onConfirm,
  onClose,
}: {
  count: number;
  pending: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<string | null>(null);

  const options = DECLINE_REASONS.map((key) => ({
    value: key,
    label: t(declineReasonLabelKey(key)),
  }));

  return (
    <Modal
      title={t("admin:members.verify.bulk.confirmDecline.title", { count })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => reason && onConfirm(reason)}
            disabled={pending || !reason}
          >
            {t("admin:members.verify.bulk.confirmDecline.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("admin:members.verify.bulk.confirmDecline.body", { count })}</p>
      <FormField
        label={t("admin:members.verify.declineModal.reasonLabel")}
        required
      >
        <Select
          multiple={false}
          value={reason}
          onChange={setReason}
          options={options}
          searchable={false}
          size="md"
          placeholder={t("admin:members.verify.declineModal.reasonPlaceholder")}
        />
      </FormField>
    </Modal>
  );
}
