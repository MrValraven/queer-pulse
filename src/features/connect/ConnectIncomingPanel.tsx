import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ConnectModal.module.css";

/**
 * They asked YOU (PRD-03).
 *
 * The panel a member reaches when they open "Say hello" on somebody whose
 * request is already waiting for them. Until this existed the send was made,
 * refused with a 409, and rendered as "you've already reached out" over a
 * message that was thrown away, on a panel offering nothing but Close.
 *
 * Two real answers, the same two the connections page offers: accept, or
 * politely decline. When the member had already written something, accepting
 * carries those words straight into the conversation it just opened, so
 * composing before realising the request was there costs nothing.
 *
 * When they wrote something with the request (a message, a reason, or both),
 * it is quoted under the body so the member answers knowing what was asked.
 * All three actions share one row on a wide sheet, wrapping on a phone.
 */
export function ConnectIncomingPanel({
  firstName,
  hasDraft,
  requestMessage,
  requestReason,
  busy,
  onAccept,
  onDecline,
  onClose,
}: {
  firstName: string;
  /** Whether the member has words waiting; changes the accept label only. */
  hasDraft: boolean;
  /** The words they sent with the request, already trimmed, or null. */
  requestMessage: string | null;
  /** The translated label of the reason they picked, or null. */
  requestReason: string | null;
  /** An answer is in flight: both buttons wait rather than fire twice. */
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const hasNote = Boolean(requestMessage || requestReason);

  return (
    <div className={styles.sent}>
      <div className={styles.noticeIcon}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 19v-1.5A4.5 4.5 0 0 1 8.5 13h3a4.5 4.5 0 0 1 4.5 4.5V19"
            stroke="rgba(var(--cream-rgb), 0.95)"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <circle
            cx={10}
            cy={8}
            r={3.2}
            stroke="rgba(var(--cream-rgb), 0.95)"
            strokeWidth={1.8}
          />
          <path
            d="M17.5 5.5v5M20 8h-5"
            stroke="rgba(var(--cream-rgb), 0.95)"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h2>
        <Translation
          i18nKey="connect:incoming.title"
          components={{ em: <em /> }}
          values={{ name: firstName }}
        />
      </h2>
      <p className={hasNote ? styles.bodyBeforeNote : undefined}>
        {t(
          hasDraft ? "connect:incoming.bodyWithDraft" : "connect:incoming.body",
          { name: firstName },
        )}
      </p>
      {hasNote && (
        <figure className={styles.note}>
          <figcaption className={styles.noteLabel}>
            {t("connect:incoming.noteLabel", { name: firstName })}
          </figcaption>
          {requestReason && (
            <div className={styles.noteReason}>
              <Translation
                i18nKey="connect:card.reason"
                components={{ b: <b /> }}
                values={{ reason: requestReason }}
              />
            </div>
          )}
          {requestMessage && (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the quote scrolls past its max height, so it is deliberately focusable: a keyboard-only member can then scroll to the end of a long message. Same justification as AdminFeatureUsagePage.tsx.
            <blockquote className={styles.noteMessage} tabIndex={0}>
              {requestMessage}
            </blockquote>
          )}
        </figure>
      )}
      <div className={styles.panelActions}>
        <Button size="lg" onClick={onAccept} disabled={busy}>
          {t(
            hasDraft
              ? "connect:incoming.acceptAndSend"
              : "connect:incoming.accept",
          )}
        </Button>
        <Button
          size="lg"
          variant="ghost-dark"
          onClick={onDecline}
          disabled={busy}
        >
          {t("connect:incoming.decline")}
        </Button>
        <Button
          size="lg"
          variant="ghost-dark"
          onClick={onClose}
          disabled={busy}
        >
          {t("connect:incoming.later")}
        </Button>
      </div>
    </div>
  );
}
