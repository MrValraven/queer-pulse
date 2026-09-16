// src/features/messages/BlockReportMessagesStep.tsx
import { useEffect, useId, useRef, useState } from "react";
import { Button, Modal, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { fileBlockReportBatch } from "./blockReportBatch";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportReasons } from "../safety/api/useReportReasons";
import type { ReportableMessageOption } from "./useBlockReportableMessages";
import styles from "./BlockReportMessagesStep.module.css";

export interface BlockReportMessagesStepProps {
  /** Counterpart's first name — matches `BlockMemberModal`'s own `firstName`. */
  name: string;
  messages: ReportableMessageOption[];
  /** Goes straight to the block confirm step with nothing filed. */
  onSkip: () => void;
  /** Files a report per selected message, then goes to the block confirm
   *  step regardless of how many landed (see `fileBlockReportBatch`). */
  onDone: () => void;
  onClose: () => void;
}

/**
 * PRD-362: the first of two steps in a conversation-started block, offered
 * only when the thread's cache already holds at least one of the
 * counterpart's reportable messages. Selecting messages and continuing files
 * one `message` report per pick — same reason code and anonymity choice for
 * the whole batch — before the existing `BlockMemberModal` confirm step
 * takes over. Skipping (or there being nothing to show) goes straight there.
 *
 * Focuses its own lead paragraph on mount rather than the modal's default
 * (the close button), per the multi-step-dialog rule: a screen-reader member
 * moving from this step to the block-confirm step should hear THIS step's
 * purpose, not silently land on a stray control.
 */
export function BlockReportMessagesStep({
  name,
  messages,
  onSkip,
  onDone,
  onClose,
}: BlockReportMessagesStepProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reasons = useReportReasons("message");
  const createReport = useCreateReport();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reasonCode, setReasonCode] = useState<string | null>(
    reasons[0]?.code ?? null,
  );
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isFiling, setIsFiling] = useState(false);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const legendId = useId();

  useEffect(() => {
    leadRef.current?.focus();
  }, []);

  function toggleSelected(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((existing) => existing !== id)
        : [...previous, id],
    );
  }

  async function handleContinue() {
    if (selectedIds.length === 0 || !reasonCode || isFiling) return;
    setIsFiling(true);
    const result = await fileBlockReportBatch(
      (input) => createReport.mutateAsync(input),
      selectedIds,
      reasonCode,
      isAnonymous,
    );
    setIsFiling(false);
    if (result.skipped > 0) {
      // The batch stopped after a 429 from the shared report-filing
      // throttle, not because these specific messages were refused, so the
      // copy here says what actually happened rather than reading like a
      // blanket failure.
      showToast(
        t("messages:blockThenReport.throttledToast", {
          succeeded: result.succeeded,
          total: selectedIds.length,
        }),
        "info",
      );
    } else if (result.failed > 0) {
      showToast(
        t("messages:blockThenReport.partialFailureToast", {
          failed: result.failed,
          total: selectedIds.length,
        }),
        "error",
      );
    }
    onDone();
  }

  return (
    <Modal
      title={t("messages:blockThenReport.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onSkip} disabled={isFiling}>
            {t("messages:blockThenReport.skipCta")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleContinue()}
            disabled={selectedIds.length === 0 || isFiling}
          >
            {isFiling
              ? t("messages:blockThenReport.continuingCta")
              : t("messages:blockThenReport.continueCta")}
          </Button>
        </>
      }
    >
      <p ref={leadRef} tabIndex={-1} className={styles.lead}>
        {t("messages:blockThenReport.lead", { name })}
      </p>

      <ul className={styles.list}>
        {messages.map((message) => (
          <li key={message.id} className={styles.item}>
            <label className={styles.itemLabel}>
              <input
                type="checkbox"
                checked={selectedIds.includes(message.id)}
                onChange={() => toggleSelected(message.id)}
              />
              <span className={styles.itemPreview}>{message.preview}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className={styles.field}>
        <div className={styles.label} id={legendId}>
          {t("safety:reportPerson.form.reasonLabel")}
        </div>
        <Select
          labelledBy={legendId}
          options={reasons.map((option) => ({
            value: option.code,
            label: option.label,
          }))}
          value={reasonCode}
          onChange={setReasonCode}
        />
      </div>

      <label className={styles.anonymousRow}>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(event) => setIsAnonymous(event.target.checked)}
        />
        {t("messages:report.anonymousLabel")}
      </label>
      <p className={styles.anonymousHelper}>
        {t("safety:report.form.identity.anonymousHelper")}
      </p>
    </Modal>
  );
}
