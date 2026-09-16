import { useEffect, useId, useRef, useState } from "react";
import { Button, Modal, FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import type { BlockOptions } from "../social/api/social.api";
import styles from "./BlockMemberModal.module.css";

/**
 * Confirmation dialog for the destructive "block" action taken from a member's
 * profile. Blocking severs any connection, so we always confirm first and let
 * the member optionally file a report and add context — the
 * `{ reason, alsoReport, reasonCode }` that `useSocial().toggleBlock` forwards
 * to `POST /blocks/:slug`.
 *
 * The reason PICKER appears only once "also report" is ticked, because that is
 * the only thing it changes: the server reads `reasonCode` when it files the
 * companion report and ignores it otherwise. Before it existed the companion
 * report was always filed as `other`, which derives the low severity band and a
 * seven-day SLA, so a member blocking someone for outing or doxxing landed in
 * the slowest queue with no code the emergency band or the transparency report
 * could see (PRD-285).
 *
 * The options come from `useReportReasons("member")`, the same hook the
 * standalone member report form uses: the server's list when it answers, the
 * local `SUBJECT_REASONS.member` mirror when it does not, and never a
 * hand-curated list beside the taxonomy it mirrors. The two paths therefore
 * offer the same reasons, in the same order, under the same labels.
 */
export function BlockMemberModal({
  firstName,
  onCancel,
  onConfirm,
  /** False only once a conversation-started block (PRD-362) has already
   *  offered its own "report messages before you block?" step right before
   *  this one — showing this line there too would be redundant. Every other
   *  caller (starting from a profile, with no thread in view) keeps the
   *  default: this is the ONLY place that ever tells that member reporting
   *  specific messages is even possible. */
  showReportMessagesGuidance = true,
}: {
  firstName: string;
  onCancel: () => void;
  onConfirm: (options: BlockOptions) => void;
  showReportMessagesGuidance?: boolean;
}) {
  const { t } = useTranslation();
  const [alsoReport, setAlsoReport] = useState(false);
  const [reason, setReason] = useState("");
  const reasonInputId = useId();
  // Never empty and never a spinner: the local taxonomy renders on first paint
  // and the server's list replaces it only once it actually arrives.
  const reportReasons = useReportReasons("member");
  const [reasonCode, setReasonCode] = useState<string | null>(
    reportReasons[0]?.code ?? null,
  );
  // Multi-step-dialog rule: when this is the SECOND step of a conversation
  // block flow (PRD-362), a screen-reader member moving from the "report
  // messages" step into this one should hear THIS step's own warning, not
  // silently land on the close button (`Modal`'s own default). Harmless as
  // the sole step too — it is still the most useful thing to land on.
  const warnRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    warnRef.current?.focus();
  }, []);

  return (
    <Modal
      title={t("safety:blockModal.title", { name: firstName })}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("safety:blockModal.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              onConfirm({
                reason: reason.trim() || undefined,
                alsoReport,
                // Sent only alongside `alsoReport`, matching what the server
                // reads. Omitted entirely when nothing is picked, which is the
                // documented fallback to `other`.
                reasonCode:
                  alsoReport && reasonCode
                    ? asReasonCode(reasonCode)
                    : undefined,
              })
            }
          >
            {t("safety:blockModal.confirmCta", { name: firstName })}
          </Button>
        </>
      }
    >
      <p ref={warnRef} tabIndex={-1} className={styles.warn}>
        {t("safety:blockModal.body", { name: firstName })}
      </p>

      {showReportMessagesGuidance && (
        <p className={styles.reportMessagesNote}>
          {t("safety:blockModal.reportMessagesFirstNote", { name: firstName })}
        </p>
      )}

      <label className={styles.reportRow}>
        <input
          type="checkbox"
          checked={alsoReport}
          onChange={(event) => setAlsoReport(event.target.checked)}
        />
        {t("safety:blockModal.reportCheckbox", { name: firstName })}
      </label>

      {alsoReport && (
        <FormField
          className={styles.reasonField}
          label={t("safety:blockModal.reasonCodeLabel")}
          helper={t("safety:blockModal.reasonCodeHelper")}
        >
          <Select
            options={reportReasons.map((option) => ({
              value: option.code,
              label: option.label,
            }))}
            value={reasonCode}
            onChange={setReasonCode}
          />
        </FormField>
      )}

      <FormField
        className={styles.reasonField}
        label={t("safety:blockModal.reasonLabel")}
      >
        <textarea
          id={reasonInputId}
          className={styles.reasonInput}
          value={reason}
          maxLength={500}
          placeholder={t("safety:blockModal.reasonPlaceholder")}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
