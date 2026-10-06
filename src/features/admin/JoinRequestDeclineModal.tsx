import { useId, useState } from "react";
import { Button, Modal, RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DECLINE_REASONS,
  declineReasonDetailKey,
  declineReasonLabelKey,
  type DeclineReason,
} from "../auth/api/joinRequestDeclineReason";
import styles from "./JoinRequestDeclineModal.module.css";

/**
 * Required-reason decline confirm for a single join request. Built on
 * `Modal` directly rather than `ConfirmDialog`, since the backend's
 * `declineReason` is a closed-set key (see `join-request-flags.ts`'s sibling
 * DTO): `ConfirmDialog`'s built-in `reason` support is a free-text textarea,
 * which doesn't fit here. Mirrors `ConfirmDialog`'s visual contract (title,
 * footer Cancel/Confirm, Confirm disabled until valid) by hand instead of
 * extending a shared primitive four other callers rely on.
 *
 * The five reasons render as a one-column `RadioCardGroup` stack (the same
 * closed-set reviewer pattern `ModJoinRequestDecline` already uses), so all
 * five are visible at once instead of hidden behind a dropdown trigger.
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
  const [reason, setReason] = useState<DeclineReason | "">("");
  const legendId = useId();

  return (
    <Modal
      wide
      eyebrow={t("admin:members.verify.declineModal.eyebrow")}
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
      <p className={styles.body}>
        {t("admin:members.verify.declineModal.body")}
      </p>
      <span className={styles.legend} id={legendId}>
        {t("admin:members.verify.declineModal.reasonLabel")}{" "}
        <span className={styles.req} aria-hidden>
          *
        </span>
      </span>
      <RadioCardGroup<DeclineReason>
        value={reason}
        onChange={setReason}
        ariaLabelledBy={legendId}
        ariaLabel={t("admin:members.verify.declineModal.reasonLabel")}
        className={styles.reasons}
        optionClassName={styles.reason}
        checkedClassName={styles.reasonChecked}
        options={DECLINE_REASONS.map((key) => ({
          id: key,
          render: (
            <>
              <span className={styles.reasonLabel}>
                {t(declineReasonLabelKey(key))}
              </span>
              <span className={styles.reasonDesc}>
                {t(declineReasonDetailKey(key))}
              </span>
            </>
          ),
        }))}
      />
    </Modal>
  );
}
