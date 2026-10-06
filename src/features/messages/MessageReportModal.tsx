// src/features/messages/MessageReportModal.tsx
import { useId, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useSocial } from "../../app/providers/useSocial";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import { logError } from "../../shared/observability/logger";
import { focusControl } from "../../shared/lib/focusFirstError";
import { MessageReportForm } from "./MessageReportForm";
import { useBlockMatchedChatMember } from "./api/useBlockMatchedChatMember";
import { useMatchedChat } from "./matchedChatContext";
import styles from "./MessageReportModal.module.css";

export interface MessageReportModalProps {
  /** The reported message's server id (report is a live-only action). */
  messageId: string;
  onClose: () => void;
  /** The message's sender — a DM counterpart's slug, or a group message's own
   *  author. Absent for an official thread (no member behind it). Drives
   *  "also block" (PRD-368): hidden without it, for an official thread, or
   *  once that member is already blocked. */
  counterpartSlug?: string;
  counterpartName?: string;
  isOfficial?: boolean;
}

/** Only the "other" reason needs the reporter to spell out what happened —
 *  every other code is specific enough on its own, and the backend accepts an
 *  empty `detail` for a `message` report either way (PRD-368). */
const OTHER_REASON_CODE = "other";

/** Report a single message. Mirrors the safety FlagModal flow (reason radios +
 *  optional detail), with `subjectType: "message"` and the message id as
 *  subject. Reason labels come from the shared safety taxonomy; the report
 *  POSTs to the same `/reports` endpoint. PRD-368 adds an anonymous toggle and
 *  an optional "also block" that fires after the report lands, so a member
 *  never has to reopen the kebab menu to finish what they came here to do. */
export function MessageReportModal({
  messageId,
  onClose,
  counterpartSlug,
  counterpartName,
  isOfficial,
}: MessageReportModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isBlocked, toggleBlock } = useSocial();
  // PRD-423: inside a matched Go together chat a sender carries a per-chat
  // member key in `counterpartSlug`, so "also block" blocks by that key,
  // resolved server-side inside this conversation.
  const matchedChatConversationId = useMatchedChat()?.conversationId;
  const blockMatchedChatMember = useBlockMatchedChatMember();
  // Server-owned taxonomy when it answers, the local one instantly and
  // silently when it does not. Never a spinner, never an empty list.
  const reasons = useReportReasons("message");
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [done, setDone] = useState(false);
  const missingHintId = useId();
  const firstReasonRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLTextAreaElement>(null);
  const [didBlock, setDidBlock] = useState(false);
  const [blockFailed, setBlockFailed] = useState(false);
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();

  const canOfferBlock = counterpartSlug
    ? !isOfficial && !isBlocked(counterpartSlug)
    : false;
  // A group message's sender can have erased their account (`senderName`
  // absent even though `senderHandle`/`counterpartSlug` still identifies
  // them, see `ChatMessage.senderName`'s own doc), so fall back to a
  // generic, still-readable word rather than interpolating `undefined` into
  // "and {name} is blocked." or "blocking {name} didn't.".
  const displayName =
    counterpartName ?? t("messages:report.genericPersonLabel");
  const isDetailRequired = reason === OTHER_REASON_CODE;
  const canSubmit =
    reason !== null && (!isDetailRequired || detail.trim().length >= 10);

  const submit = () => {
    if (createReport.isPending) return;
    if (!canSubmit || reason === null) {
      // The submit stays focusable while blocked, so a press lands the
      // reporter on the field that still needs them.
      focusControl(
        reason === null ? firstReasonRef.current : detailRef.current,
      );
      return;
    }
    createReport.mutate(
      {
        subjectType: "message",
        subjectId: messageId,
        reasonCode: asReasonCode(reason),
        detail: detail.trim() || undefined,
        anonymous: isAnonymous,
      },
      {
        onSuccess: () => {
          if (canOfferBlock && alsoBlock && counterpartSlug) {
            const onBlockSettled = (didSucceed: boolean) => {
              setDidBlock(didSucceed);
              setBlockFailed(!didSucceed);
              setDone(true);
            };
            if (matchedChatConversationId) {
              blockMatchedChatMember(
                matchedChatConversationId,
                counterpartSlug,
                onBlockSettled,
              );
            } else {
              toggleBlock(counterpartSlug, undefined, onBlockSettled);
            }
            return;
          }
          setDone(true);
        },
        onError: (error) => {
          logError(error, { scope: "messages.reportMessage" });
          // Never tell a reporter "received" when the report didn't land —
          // surface an honest error and keep the form filled in to retry. A
          // rolling flood cap or a non-participant refusal answers with its
          // own member-facing explanation, which `describeReportError` shows
          // in place of the generic line.
          showToast(
            describeReportError(error, t("safety:reportPerson.error")),
            "error",
          );
        },
      },
    );
  };

  if (done) {
    return (
      <Modal
        title={
          didBlock ? (
            <Translation
              i18nKey="messages:report.success.combinedTitle"
              components={{ em: <em /> }}
              values={{ name: displayName }}
            />
          ) : (
            <Translation
              i18nKey="safety:reportPerson.success.title"
              components={{ em: <em /> }}
            />
          )
        }
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={onClose}>
            {t("safety:reportPerson.success.doneCta")}
          </Button>
        }
      >
        <p>
          {didBlock
            ? t("messages:report.success.combinedBody", {
                name: displayName,
              })
            : t("safety:reportPerson.success.body")}
        </p>
        {blockFailed && (
          <p role="alert" className={styles.blockFailedNote}>
            {t("messages:report.success.blockFailedNote", {
              name: displayName,
            })}
          </p>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      title={t("messages:report.title")}
      onClose={onClose}
      sub={t("safety:reportPerson.form.lead")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("safety:reportPerson.form.cancelCta")}
          </Button>
          {/* aria-disabled keeps the submit in the tab order, so the hint it
              points at is heard and an early press can move focus. */}
          <Button
            variant="primary"
            onClick={submit}
            aria-disabled={!canSubmit || createReport.isPending}
            aria-describedby={canSubmit ? undefined : missingHintId}
          >
            {createReport.isPending
              ? t("safety:reportPerson.form.submitting")
              : t("safety:reportPerson.form.submitCta")}
          </Button>
        </>
      }
    >
      <MessageReportForm
        reasons={reasons}
        reason={reason}
        onReasonChange={setReason}
        firstReasonRef={firstReasonRef}
        detailRef={detailRef}
        missingHintId={missingHintId}
        detail={detail}
        onDetailChange={setDetail}
        isDetailRequired={isDetailRequired}
        isAnonymous={isAnonymous}
        onAnonymousChange={setIsAnonymous}
        alsoBlockLabel={
          canOfferBlock
            ? t("messages:report.alsoBlockLabel", { name: displayName })
            : undefined
        }
        alsoBlock={alsoBlock}
        onAlsoBlockChange={setAlsoBlock}
      />
    </Modal>
  );
}
