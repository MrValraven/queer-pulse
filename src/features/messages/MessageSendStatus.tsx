// src/features/messages/MessageSendStatus.tsx
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BubbleMetaAlign } from "./useBubbleMetaAlign";
import { PendingIcon, SentIcon, DoubleTickIcon } from "./messageIcons";
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
        <PendingIcon size={12} strokeWidth={2.5} aria-hidden="true" />
      ) : status === "sent" ? (
        <SentIcon size={12} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        // Tabler's double-tick glyph sits in a 24x24 viewBox with its ink
        // spanning roughly y:6-18, so a vertical crop (viewBox="0 3.5 24 17")
        // keeps every stroke intact while an explicit style height wins over
        // react-icons' forced square width/height attributes (CSS beats a
        // presentation attribute). That renders the icon at the bespoke
        // original's 17x12 footprint, so `.metaTick`'s fixed-width container
        // stays untouched, at a scale close enough between the two axes to
        // read as uniform, and lands the stroke around 1.4px to match the
        // other rungs (pending/sent get the same target via strokeWidth
        // above instead, since their icons render from an uncropped square
        // viewBox).
        <DoubleTickIcon
          size={17}
          viewBox="0 3.5 24 17"
          style={{ height: 12 }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

/** WhatsApp-style meta shown on a run's last bubble: a small time, plus (on the
 *  user's own outgoing bubble) the send-status tick. `floating` tucks it into a
 *  text bubble's bottom-right (text wraps around it); otherwise it renders as a
 *  standalone line under the bubble's content. `align` is the floating case's
 *  vertical position — centred on a one-line bubble's single text line, tucked
 *  flush into the corner on a multi-line one (see `useBubbleMetaAlign`).
 *
 *  `isOnBubbleSurface` is a separate question from `floating`: whether this meta
 *  sits on a COLOURED bubble surface (plum sent / paper received) rather than
 *  directly on the cream page. The two usually coincide — a floating meta is
 *  always on a bubble, a standalone line under an emoji/image/document bubble
 *  is always on the page — so it defaults to `floating` and none of those
 *  callers need to pass it. The one caller where they diverge is the
 *  card-only link-preview text bubble: its meta doesn't float (there's no
 *  text line to tuck into), but it still sits on the coloured bubble, not the
 *  page, so it passes `isOnBubbleSurface={true}` explicitly. */
export function MessageMeta({
  time,
  isSent,
  metaStatus,
  floating,
  isOnBubbleSurface = floating,
  align = "center",
}: {
  time?: string;
  isSent: boolean;
  metaStatus: MetaStatus;
  floating: boolean;
  isOnBubbleSurface?: boolean;
  align?: BubbleMetaAlign;
}) {
  // Colour only tracks sent/received when this meta sits on a coloured bubble
  // surface; a standalone line on the cream page always stays muted ink.
  const colorClass =
    isOnBubbleSurface && isSent
      ? styles.bubbleMetaSent
      : styles.bubbleMetaReceived;
  return (
    <span
      className={[
        floating ? styles.bubbleMeta : styles.bubbleMetaBelow,
        floating && align === "bottom" && styles.bubbleMetaBottom,
        floating && align === "flush" && styles.bubbleMetaFlush,
        colorClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {time && <span>{time}</span>}
      {isSent && metaStatus && <SendStatusTick status={metaStatus} />}
    </span>
  );
}
