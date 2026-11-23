import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { UNREAD_COUNT_KEY } from "./api/useConversations";
import { isMessageBodyOverLimit } from "./messageBodyLimit";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * Failed sends refused for the mailbox they were sent as. Retrying the same
 * payload meets the same refusal, so each shows its reason with no Retry.
 */
const MAILBOX_FAILURE_KEYS: Record<string, string> = {
  IDENTITY_NOT_STAFF: "messages:mailbox.failure.notStaff",
  IDENTITY_REMOVED: "messages:mailbox.failure.removed",
  IDENTITY_NOT_IN_CONVERSATION: "messages:mailbox.failure.wrongMailbox",
};

/**
 * PRD-511: the other sends the server refuses for good. Each code names its
 * own reason, so the row says why and offers no Retry. `RECIPIENT_UNAVAILABLE`
 * covers a block either way and its copy never names the block.
 */
const PERMANENT_SEND_FAILURE_KEYS: Record<string, string> = {
  SENDER_ACCOUNT_INACTIVE: "messages:status.failure.accountInactive",
  GROUP_MEMBERSHIP_ENDED: "messages:status.failure.groupLeft",
  RECIPIENT_NOT_CONNECTED: "messages:status.failure.notConnected",
  RECIPIENT_UNAVAILABLE: "messages:status.failure.recipientUnavailable",
  OFFICIAL_THREAD_READ_ONLY: "messages:status.failure.officialReadOnly",
  GIF_HOST_NOT_ALLOWED: "messages:status.failure.gifSource",
};

export interface MessageRunFailedRowProps {
  /** The run's last message, already known to be a failed own send. */
  message: ChatMessage;
  /** Retries the failed optimistic send. */
  onRetry?: (message: ChatMessage) => void;
}

/**
 * The standalone row under a run whose last own message failed to send. Time
 * and sending/seen ticks live in each bubble's own meta; only the failed
 * state keeps a row of its own, since retry is an action.
 */
export function MessageRunFailedRow({
  message,
  onRetry,
}: MessageRunFailedRowProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isLostSeat = message.failureCode === "IDENTITY_NOT_STAFF";

  // The member no longer answers for this mailbox. The `mailbox:staffing`
  // frame usually refreshed the switcher already; this covers a missed frame,
  // so the switcher drops the lost mailbox and the lost-access fallback runs.
  useEffect(() => {
    if (!isLostSeat) return;
    void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
  }, [isLostSeat, queryClient]);

  const permanentFailureKey = message.failureCode
    ? (MAILBOX_FAILURE_KEYS[message.failureCode] ??
      PERMANENT_SEND_FAILURE_KEYS[message.failureCode])
    : undefined;
  if (permanentFailureKey) {
    return (
      <span className={styles.failedReason}>{t(permanentFailureKey)}</span>
    );
  }

  // A body that's grown past the server's length limit since it was typed
  // (DES-202) can never succeed on retry: the server rejects it the same way
  // every time, so a short reason takes Retry's place.
  if (isMessageBodyOverLimit(message.text)) {
    return (
      <span className={styles.failedReason}>
        {t("messages:status.tooLongToSend")}
      </span>
    );
  }

  if (message.failureCode === "ACCOUNT_RESTRICTED") {
    // ENG-242: a moderator `restrict` action refused this send. It gets its
    // own reason line: a standing moderation state has its own name, and no
    // sign-in prompt applies here. Retry stays offered: the restriction is
    // timed and may have lifted by the time the member tries again.
    return (
      <>
        <span className={styles.failedReason}>
          {t("messages:status.restricted")}
        </span>
        {/* `status.retryAction` is the bare verb ("Retry"). The reason span
            above already says "Not delivered", so `status.retry`'s full
            string would repeat that prefix on two stacked lines. */}
        <button
          type="button"
          className={styles.retryBtn}
          onClick={() => onRetry?.(message)}
        >
          {t("messages:status.retryAction")}
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      className={styles.retryBtn}
      onClick={() => onRetry?.(message)}
    >
      {t("messages:status.retry")}
    </button>
  );
}
