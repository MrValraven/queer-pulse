import { useId, useState } from "react";
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
}: {
  firstName: string;
  onCancel: () => void;
  onConfirm: (options: BlockOptions) => void;
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
      <p className={styles.warn}>
        {t("safety:blockModal.body", { name: firstName })}
      </p>

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
