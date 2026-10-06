import { useId, useState } from "react";
import { Button, Modal, RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  APPROVAL_REASONS,
  approvalReasonDetailKey,
  approvalReasonLabelKey,
  type ApprovalReason,
} from "../auth/api/joinRequestApprovalReason";
import styles from "./JoinRequestDeclineModal.module.css";

/**
 * Required-reason approve confirm for a single join request, the twin of
 * `JoinRequestDeclineModal`. An approval mints an invite, so "Welcome in" on a
 * card opens this step and the reviewer records why before anything is sent.
 * The reason is staff-only: it lets the people working the queue read each
 * other's calls against one bar, the same job the decline reason does.
 *
 * Same visual contract as the decline confirm (title, Cancel/Confirm footer,
 * Confirm disabled until a reason is picked, the one-column `RadioCardGroup`
 * stack) and the same stylesheet, so the two decisions read as one system. The
 * confirm is the jade "welcome" variant every approve button on the queue uses.
 */
export function JoinRequestApproveModal({
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
  const [reason, setReason] = useState<ApprovalReason | "">("");
  const legendId = useId();

  return (
    <Modal
      wide
      eyebrow={t("admin:members.verify.approveModal.eyebrow")}
      title={t("admin:members.verify.approveModal.title", {
        name: applicantName,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="jade"
            onClick={() => reason && onConfirm(reason)}
            disabled={pending || !reason}
          >
            {t("admin:members.verify.approveModal.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={styles.body}>
        {t("admin:members.verify.approveModal.body")}
      </p>
      <span className={styles.legend} id={legendId}>
        {t("admin:members.verify.approveModal.reasonLabel")}{" "}
        <span className={styles.req} aria-hidden>
          *
        </span>
      </span>
      <RadioCardGroup<ApprovalReason>
        value={reason}
        onChange={setReason}
        ariaLabelledBy={legendId}
        ariaLabel={t("admin:members.verify.approveModal.reasonLabel")}
        className={styles.reasons}
        optionClassName={styles.reason}
        checkedClassName={styles.reasonCheckedJade}
        options={APPROVAL_REASONS.map((key) => ({
          id: key,
          render: (
            <>
              <span className={styles.reasonLabel}>
                {/* Never null for a key from the closed set; the fallback
                    only satisfies the nullable return type. */}
                {t(
                  approvalReasonLabelKey(key) ??
                    "admin:members.verify.approvalReason.other",
                )}
              </span>
              <span className={styles.reasonDesc}>
                {t(approvalReasonDetailKey(key))}
              </span>
            </>
          ),
        }))}
      />
    </Modal>
  );
}
