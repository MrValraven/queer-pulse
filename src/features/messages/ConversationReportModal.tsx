// src/features/messages/ConversationReportModal.tsx
import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./MessagesPage.module.css";

export type ConversationReportModalProps =
  | {
      kind: "member";
      /** The counterpart's user id (live) — falls back to their slug in demo
       *  mode, where the report never leaves the device (see `useCreateReport`). */
      subjectId: string;
      /** First name, for the title/toast copy. */
      name: string;
      onClose: () => void;
    }
  | {
      kind: "group";
      /** The group conversation's own id — the report subject (PRD-356). */
      conversationId: string;
      /** The group's title, for the modal heading + success copy. */
      groupTitle: string;
      onClose: () => void;
    };

/**
 * Report the DM counterpart themself, or a whole GROUP (PRD-356) — never one
 * message. Opened from `ConversationSafetyMenu` (member) or the group's own
 * conversation menu (group, wired separately). Same reason-taxonomy +
 * detail-textarea shape and the same `/reports` mutation either way;
 * `kind` picks the subject type (`member` vs `conversation`), which reason
 * set `useReportReasons` renders, and which copy this modal shows — a group
 * report is about the group itself (its name, who its owner lets in), not
 * about any one person in it, so its lead/success copy says that rather than
 * offering to block somebody.
 */
export function ConversationReportModal(props: ConversationReportModalProps) {
  const { onClose } = props;
  const isGroupReport = props.kind === "group";
  const subjectId = isGroupReport ? props.conversationId : props.subjectId;
  const displayName = isGroupReport ? props.groupTitle : props.name;

  const { t } = useTranslation();
  const { showToast } = useToast();
  // Server-owned taxonomy when it answers, the local one instantly and
  // silently when it does not. Never a spinner, never an empty list.
  const reasons = useReportReasons(isGroupReport ? "conversation" : "member");
  const [reason, setReason] = useState<string>(reasons[0]!.code);
  const detailFieldId = useId();
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();

  const copy = isGroupReport
    ? {
        lead: t("safety:reportGroup.form.lead"),
        reasonLabel: t("safety:reportGroup.form.reasonLabel"),
        detailLabel: t("safety:reportGroup.form.detailLabel"),
        detailPlaceholder: t("safety:reportGroup.form.detailPlaceholder"),
        cancelCta: t("safety:reportGroup.form.cancelCta"),
        submitting: t("safety:reportGroup.form.submitting"),
        submitCta: t("safety:reportGroup.form.submitCta"),
        errorFallback: t("safety:reportGroup.error"),
        successTitleKey: "safety:reportGroup.success.title",
        successBody: t("safety:reportGroup.success.body"),
        successDoneCta: t("safety:reportGroup.success.doneCta"),
        charsRemaining: (count: number) =>
          t("safety:reportGroup.form.charsRemaining", { count }),
        charsCount: (count: number) =>
          t("safety:reportGroup.form.charsCount", { count }),
      }
    : {
        lead: t("safety:reportPerson.form.lead"),
        reasonLabel: t("safety:reportPerson.form.reasonLabel"),
        detailLabel: t("safety:reportPerson.form.detailLabel"),
        detailPlaceholder: t("safety:reportPerson.form.detailPlaceholder"),
        cancelCta: t("safety:reportPerson.form.cancelCta"),
        submitting: t("safety:reportPerson.form.submitting"),
        submitCta: t("safety:reportPerson.form.submitCta"),
        errorFallback: t("safety:reportPerson.error"),
        successTitleKey: "safety:reportPerson.success.title",
        successBody: t("safety:reportPerson.success.body"),
        successDoneCta: t("safety:reportPerson.success.doneCta"),
        charsRemaining: (count: number) =>
          t("safety:reportPerson.form.charsRemaining", { count }),
        charsCount: (count: number) =>
          t("safety:reportPerson.form.charsCount", { count }),
      };

  const canSubmit = detail.trim().length >= 10;
  const charsLeft = 10 - detail.trim().length;

  const submit = () => {
    if (!canSubmit || createReport.isPending) return;
    createReport.mutate(
      {
        subjectType: isGroupReport ? "conversation" : "member",
        subjectId,
        reasonCode: asReasonCode(reason),
        detail: detail.trim(),
      },
      {
        onSuccess: () => setDone(true),
        onError: (error) => {
          logError(error, {
            scope: isGroupReport
              ? "messages.reportGroup"
              : "messages.reportMember",
          });
          // Never tell a reporter "received" when the report didn't land —
          // surface an honest error and keep the form filled in to retry. A
          // rolling flood cap answers with its own member-facing explanation,
          // which `describeReportError` shows in place of the generic line.
          showToast(describeReportError(error, copy.errorFallback), "error");
        },
      },
    );
  };

  if (done) {
    return (
      <Modal
        title={
          <Translation
            i18nKey={copy.successTitleKey}
            components={{ em: <em /> }}
          />
        }
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={onClose}>
            {copy.successDoneCta}
          </Button>
        }
      >
        <p>{copy.successBody}</p>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        isGroupReport
          ? t("messages:report.groupTitle", { name: displayName })
          : t("messages:report.memberTitle", { name: displayName })
      }
      onClose={onClose}
      sub={copy.lead}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {copy.cancelCta}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={!canSubmit || createReport.isPending}
          >
            {createReport.isPending ? copy.submitting : copy.submitCta}
          </Button>
        </>
      }
    >
      <div className={styles.reportLabel}>{copy.reasonLabel}</div>
      <div className={styles.reportOpts}>
        {reasons.map((option) => (
          <label
            key={option.code}
            className={[
              styles.reportOpt,
              reason === option.code && styles.reportOptChecked,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name="conversation-report-reason"
              value={option.code}
              checked={reason === option.code}
              onChange={() => setReason(option.code)}
            />
            {option.label}
          </label>
        ))}
      </div>
      <label className={styles.reportLabel} htmlFor={detailFieldId}>
        {copy.detailLabel}
      </label>
      <textarea
        id={detailFieldId}
        className={styles.reportTextarea}
        placeholder={copy.detailPlaceholder}
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
      />
      <div className={styles.reportCounter}>
        {charsLeft > 0
          ? copy.charsRemaining(charsLeft)
          : copy.charsCount(detail.trim().length)}
      </div>
    </Modal>
  );
}
