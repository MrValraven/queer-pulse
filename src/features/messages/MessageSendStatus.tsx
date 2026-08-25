// src/features/messages/MessageSendStatus.tsx
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

/** The honest send-status ladder the in-bubble tick renders (own bubbles only):
 *  clock while sending → single check once the server acked (sent) → double
 *  check once the recipient's device received it (delivered) → jade double check
 *  once read (seen). `null` = no tick (received bubbles; a failed send, which
 *  shows its own retry row instead). */
export type MetaStatus = "sending" | "sent" | "delivered" | "seen" | null;

/** i18n key per rung, so the tick carries a text alternative ("Sent"/"Read"/…). */
const STATUS_LABEL_KEY = {
  sending: "messages:status.sending",
  sent: "messages:status.sent",
  delivered: "messages:status.delivered",
  seen: "messages:status.seen",
} as const;

/** The send-status glyph for the in-bubble meta: a clock while sending, a single
 *  check once sent, a double check once delivered, a jade double check once
 *  seen. Only ever rendered on the user's own outgoing bubble (so it sits on the
 *  plum surface). Accessible name via the status i18n keys; the SVG is decorative.
 *  Colour: delivered/sent inherit the muted meta colour, only `seen` goes jade. */
export function SendStatusTick({
  status,
}: {
  status: Exclude<MetaStatus, null>;
}) {
  const { t } = useTranslation();
  const label = t(STATUS_LABEL_KEY[status]);
  return (
    <span
      className={[styles.metaTick, status === "seen" && styles.metaTickSeen]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={label}
      title={label}
    >
      {status === "sending" ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.6V8l2.3 1.6" />
        </svg>
      ) : status === "sent" ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1.5 7.5 5 11l7-8" />
        </svg>
      ) : (
        <svg
          width="17"
          height="12"
          viewBox="0 0 20 14"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1.5 7.5 5 11l6.5-8" />
          <path d="M8.5 11 15 3" />
        </svg>
      )}
    </span>
  );
}

/** WhatsApp-style meta shown on a run's last bubble: a small time, plus (on the
 *  user's own outgoing bubble) the send-status tick. `floating` tucks it into a
 *  text bubble's bottom-right (text wraps around it); otherwise it renders as a
 *  standalone line under an emoji-only message. */
export function MessageMeta({
  time,
  isSent,
  metaStatus,
  floating,
}: {
  time?: string;
  isSent: boolean;
  metaStatus: MetaStatus;
  floating: boolean;
}) {
  // Colour only tracks sent/received when tucked inside a coloured bubble; the
  // standalone (emoji) line always sits on the page, so it stays muted ink.
  const colorClass =
    floating && isSent ? styles.bubbleMetaSent : styles.bubbleMetaReceived;
  return (
    <span
      className={[
        floating ? styles.bubbleMeta : styles.bubbleMetaBelow,
        colorClass,
      ].join(" ")}
    >
      {time && <span>{time}</span>}
      {isSent && metaStatus && <SendStatusTick status={metaStatus} />}
    </span>
  );
}
