import { useState } from "react";
import { Button, FormField, Modal, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DECLINE_REASONS,
  declineReasonLabelKey,
} from "../auth/api/joinRequestDeclineReason";

/**
 * Required-reason decline confirm for a single join request. Built on
 * `Modal` directly rather than `ConfirmDialog`, since the backend's
 * `declineReason` is a closed-set key (see `join-request-flags.ts`'s sibling
 * DTO), not free text — `ConfirmDialog`'s built-in `reason` support is a
 * textarea, which doesn't fit here. Mirrors `ConfirmDialog`'s visual
 * contract (title, footer Cancel/Confirm, Confirm disabled until valid) by
 * hand instead of extending a shared primitive four other callers rely on.
 */
export function JoinRequestDeclineModal({
  applicantName,
  pending,
  onConfirm,
  onClose,
}: {
  applicantName: string;
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
      title={t("admin:members.verify.declineModal.title", {
        name: applicantName,
      })}
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
            {t("admin:members.verify.declineModal.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("admin:members.verify.declineModal.body")}</p>
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
