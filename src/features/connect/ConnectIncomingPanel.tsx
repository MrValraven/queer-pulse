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
 */
export function ConnectIncomingPanel({
  firstName,
  hasDraft,
  busy,
  onAccept,
  onDecline,
  onClose,
}: {
  firstName: string;
  /** Whether the member has words waiting; changes the accept label only. */
  hasDraft: boolean;
  /** An answer is in flight: both buttons wait rather than fire twice. */
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

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
      <p>
        {t(
          hasDraft ? "connect:incoming.bodyWithDraft" : "connect:incoming.body",
          { name: firstName },
        )}
      </p>
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
      </div>
      <div className={styles.panelActions}>
        <Button
          size="sm"
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
