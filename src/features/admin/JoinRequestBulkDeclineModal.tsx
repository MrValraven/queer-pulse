import { useEffect, useId, useRef, useState } from "react";
import { Button, Modal, RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DECLINE_REASONS,
  declineReasonDetailKey,
  declineReasonLabelKey,
  type DeclineReason,
} from "../auth/api/joinRequestDeclineReason";
import bulkStyles from "./JoinRequestBulk.module.css";
import styles from "./JoinRequestDeclineModal.module.css";

/**
 * The bulk sibling of `JoinRequestDeclineModal`, kept a separate component for
 * the same reason `VerificationBulkRejectModal` stays apart from the single-row
 * verification drawer's own reject confirm: the two call sites are free to
 * evolve independently (a bulk decline might eventually want a "these ids
 * differ, are you sure" warning a single decline never would).
 *
 * The reasons render as the same one-column `RadioCardGroup` stack the
 * single-request modal uses, so all five are visible at once. A dropdown here
 * failed: this dialog's body is short, and opening the panel scrolled the body
 * until its own trigger slid under the title and the list was cut off.
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
  const [reason, setReason] = useState<DeclineReason | "">("");
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
      <p className={styles.body}>
        {t("admin:members.verify.bulk.confirmDecline.body", { count })}
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
      {/* The confirmation proper: one line naming the reason that will be
          written against every selected request, so the reviewer confirms
          against exactly what is about to be recorded. Announced, since it
          appears only once a reason is chosen. */}
      {reason && (
        <p ref={statusLineRef} className={bulkStyles.reasonLine} role="status">
          {t("admin:members.verify.bulk.confirmDecline.reasonLine", {
            count,
            reason: t(declineReasonLabelKey(reason)),
          })}
        </p>
      )}
    </Modal>
  );
}
