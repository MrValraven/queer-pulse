import { useEffect, useId, useRef, useState } from "react";
import {
  Button,
  FormField,
  Modal,
  RadioCardGroup,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  APPROVAL_NOTE_MAX_LENGTH,
  APPROVAL_REASONS,
  approvalReasonDetailKey,
  approvalReasonLabelKey,
  approvalReasonNeedsNote,
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
 * Picking "Other" opens the same required note the single-request modal asks
 * for, and that one note is recorded with the reason on every request.
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
  onConfirm: (reason: string, note?: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ApprovalReason | "">("");
  const [note, setNote] = useState("");
  const legendId = useId();
  const statusLineRef = useRef<HTMLParagraphElement>(null);
  const isNoteNeeded = approvalReasonNeedsNote(reason);
  const isConfirmDisabled =
    pending || !reason || (isNoteNeeded && !note.trim());

  // The line the reviewer confirms against must not open half hidden behind
  // the footer on a short screen. `nearest` scrolls only the minimum, and
  // instantly; the call is optional because jsdom lacks `scrollIntoView`.
  useEffect(() => {
    if (reason) statusLineRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [reason]);

  function confirm() {
    if (!reason || isConfirmDisabled) return;
    // A single argument for every other reason: only "Other" carries a note.
    if (isNoteNeeded) onConfirm(reason, note.trim());
    else onConfirm(reason);
  }

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
          <Button variant="jade" onClick={confirm} disabled={isConfirmDisabled}>
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
      {isNoteNeeded && (
        <FormField
          className={styles.noteField}
          label={t("admin:members.verify.approveModal.noteLabel")}
          required
          labelAside={`${note.length}/${APPROVAL_NOTE_MAX_LENGTH}`}
          helper={t("admin:members.verify.approveModal.noteHelper")}
        >
          <textarea
            value={note}
            rows={3}
            maxLength={APPROVAL_NOTE_MAX_LENGTH}
            onChange={(event) => setNote(event.target.value)}
          />
        </FormField>
      )}
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
