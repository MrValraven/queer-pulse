import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import styles from "./AdminHousingGroupListingsPage.module.css";

/**
 * The reason a reviewer writes when a reading-group proposal is declined.
 *
 * Required by the backend and sent to the proposer, so the prompt says who
 * reads it. Somebody picked a book, said why it mattered and chose how many
 * people it was for; a bare "no" is the outcome this dialog exists to prevent.
 */
export function AdminReadingGroupDeclineModal({
  book,
  isPending,
  onSubmit,
  onClose,
}: {
  book: string;
  isPending: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length >= 4;

  return (
    <AdminModal
      eyebrow={t("admin:adminReadingGroupProposals.decline.eyebrow")}
      title={t("admin:adminReadingGroupProposals.decline.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={!isValid || isPending}
            onClick={() => onSubmit(trimmedReason)}
          >
            {t("admin:adminReadingGroupProposals.action.decline")}
          </Button>
        </>
      }
    >
      <p className={styles.reasonListing}>{book}</p>
      <label
        className={styles.reasonLabel}
        htmlFor="reading-group-decline-reason"
      >
        {t("admin:adminReadingGroupProposals.decline.label")}
      </label>
      <textarea
        id="reading-group-decline-reason"
        className={styles.reasonInput}
        value={reason}
        maxLength={500}
        rows={5}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t("admin:adminReadingGroupProposals.decline.placeholder")}
        aria-describedby="reading-group-decline-reason-hint"
      />
      <p id="reading-group-decline-reason-hint" className={styles.reasonHint}>
        {t("admin:adminReadingGroupProposals.decline.hint")}
      </p>
    </AdminModal>
  );
}
