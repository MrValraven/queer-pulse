import { useId, useState } from "react";
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
import styles from "./JoinRequestDeclineModal.module.css";

/**
 * Required-reason approve confirm for a single join request, the twin of
 * `JoinRequestDeclineModal`. An approval mints an invite, so "Welcome in" on a
 * card opens this step and the reviewer records why before anything is sent.
 * The reason is staff-only: it lets the people working the queue read each
 * other's calls against one bar, the same job the decline reason does.
 * "Other" on its own says nothing, so picking it opens a required note under
 * the cards where the reviewer writes what the reason was; it is sent with
 * the reason, and a draft survives switching to another card and back.
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
  onConfirm: (reason: string, note?: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ApprovalReason | "">("");
  const [note, setNote] = useState("");
  const legendId = useId();
  const isNoteNeeded = approvalReasonNeedsNote(reason);
  const isConfirmDisabled =
    pending || !reason || (isNoteNeeded && !note.trim());

  function confirm() {
    if (!reason || isConfirmDisabled) return;
    // A single argument for every other reason: only "Other" carries a note.
    if (isNoteNeeded) onConfirm(reason, note.trim());
    else onConfirm(reason);
  }

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
          <Button variant="jade" onClick={confirm} disabled={isConfirmDisabled}>
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
    </Modal>
  );
}
