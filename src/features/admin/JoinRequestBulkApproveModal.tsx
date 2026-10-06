import { useEffect, useId, useRef, useState } from "react";
import { Button, Modal, RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  APPROVAL_REASONS,
  approvalReasonDetailKey,
  approvalReasonLabelKey,
  type ApprovalReason,
} from "../auth/api/joinRequestApprovalReason";
import bulkStyles from "./JoinRequestBulk.module.css";
import styles from "./JoinRequestDeclineModal.module.css";

/** The label key for a picked reason. Never null for a key from the closed
 *  set; the fallback only satisfies `approvalReasonLabelKey`'s nullable type. */
function reasonLabelKey(reason: string): string {
  return (
    approvalReasonLabelKey(reason) ??
    "admin:members.verify.approvalReason.other"
  );
}

/**
 * The bulk sibling of `JoinRequestApproveModal`, kept a separate component for
 * the same reason `JoinRequestBulkDeclineModal` is one: the single-row and the
 * batch confirm are free to evolve independently. One reason is picked for the
 * whole batch and recorded against every selected request, staff-only.
 *
 * The reasons render as the same one-column `RadioCardGroup` stack the
 * single-request modal uses, so all five are visible at once. A dropdown here
 * failed: this dialog's body is short, and opening the panel scrolled the body
 * until its own trigger slid under the title and the list was cut off.
 */
export function JoinRequestBulkApproveModal({
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
  const [reason, setReason] = useState<ApprovalReason | "">("");
  const legendId = useId();
  const statusLineRef = useRef<HTMLParagraphElement>(null);

  // The line the reviewer confirms against must not open half hidden behind
  // the footer on a short screen. `nearest` scrolls only the minimum, and
  // instantly; the call is optional because jsdom lacks `scrollIntoView`.
  useEffect(() => {
    if (reason) statusLineRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [reason]);

  return (
    <Modal
      wide
      title={t("admin:members.verify.bulk.confirmApprove.title", { count })}
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
            {t("admin:members.verify.bulk.confirmApprove.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={styles.body}>
        {`${t("admin:members.verify.bulk.confirmApprove.body", { count })} ${t("admin:members.verify.bulk.confirmApprove.reasonBody", { count })}`}
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
                {t(reasonLabelKey(key))}
              </span>
              <span className={styles.reasonDesc}>
                {t(approvalReasonDetailKey(key))}
              </span>
            </>
          ),
        }))}
      />
      {/* The same confirmation line the bulk decline shows: the reviewer
          confirms against the reason about to be recorded on every selected
          request. Announced, since it appears only once a reason is chosen. */}
      {reason && (
        <p ref={statusLineRef} className={bulkStyles.reasonLine} role="status">
          {t("admin:members.verify.bulk.confirmApprove.reasonLine", {
            count,
            reason: t(reasonLabelKey(reason)),
          })}
        </p>
      )}
    </Modal>
  );
}
