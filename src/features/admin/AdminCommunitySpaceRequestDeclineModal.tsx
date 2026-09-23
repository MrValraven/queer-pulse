import { useState } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import styles from "./AdminLandlordsPage.module.css";

const DECLINE_REASON_MAX_LENGTH = 300;

/**
 * The decline dialog for a "Request spaces" submission. The reason is
 * optional here (unlike `AdminLandlordReasonModal`'s required decisions):
 * declining a space request is not an answer to work a member did, it is a
 * governance call the requester may or may not need spelled out. Built on
 * `AdminLandlordReasonModal`'s eyebrow/title/footer, but the reason field
 * itself goes through `FormField` (id wiring, AA-contrast border, visible
 * focus halo, a live character count) rather than `AdminLandlordsPage`'s raw
 * `.reasonInput`, whose border fails 1.4.11 and whose `:focus` suppresses
 * the two-tone ring.
 */
export function AdminCommunitySpaceRequestDeclineModal({
  communityName,
  isPending,
  onSubmit,
  onClose,
}: {
  communityName: string;
  isPending: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <AdminModal
      eyebrow={t("admin:adminCommunitySpaceRequests.decline.eyebrow")}
      title={t("admin:adminCommunitySpaceRequests.decline.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={isPending}
            onClick={() => onSubmit(reason.trim())}
          >
            {t("admin:adminCommunitySpaceRequests.decline.confirm")}
          </Button>
        </>
      }
    >
      <p className={styles.reasonSubject}>{communityName}</p>
      <FormField
        label={t("admin:adminCommunitySpaceRequests.decline.label")}
        helper={t("admin:adminCommunitySpaceRequests.decline.hint")}
        labelAside={`${reason.length}/${DECLINE_REASON_MAX_LENGTH}`}
      >
        <textarea
          value={reason}
          maxLength={DECLINE_REASON_MAX_LENGTH}
          rows={4}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t(
            "admin:adminCommunitySpaceRequests.decline.placeholder",
          )}
        />
      </FormField>
    </AdminModal>
  );
}
