import { useState, type ReactNode } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useSubmitFlow } from "./modalFlow";
import styles from "./ApplicationModals.module.css";

interface ContactRequestModalProps {
  /** Who the request goes to — used in the heading and success copy. */
  toName: string;
  /** Optional small eyebrow above the title (e.g. "Housing · Introduction"). */
  eyebrow?: string;
  /** Title text before the coral <em>. Defaults to "Send a". */
  title?: string;
  /** The emphasised word (coral italic). Defaults to "request." */
  em?: string;
  /** One warm sentence describing what this is. */
  subtitle?: string;
  /** Pre-filled message body. */
  preset?: string;
  /** Success-panel title before the <em>. Defaults to "Request". */
  successTitle?: string;
  /** Success-panel emphasised word. Defaults to "sent." */
  successEm?: string;
  /** Success-panel body. */
  successBody?: ReactNode;
  /** Verb on the send button. Defaults to "Send request". */
  sendLabel?: string;
  /** Spinner label while sending. Defaults to "Sending…". */
  sendingLabel?: string;
  /** Minimum characters before the button enables. */
  minChars?: number;
  /**
   * Optional real send path. When provided, `submit` awaits this instead of
   * the default `useSubmitFlow` fake timer, then flips to the success panel.
   * A rejection surfaces a toast and leaves the form open so the member can
   * retry. Omit to keep the original timer-only behavior unchanged (existing
   * mentoring/company call-sites don't pass this).
   */
  onSend?: (message: string) => Promise<void>;
  onClose: () => void;
}

/**
 * One reusable compose → loading → plum-panel-success flow for any "reach out"
 * action in the economy area (introductions, mentoring sessions, contacting a
 * practitioner). Wraps ModalKit so the success state is the standard plum panel.
 */
export function ContactRequestModal({
  toName,
  eyebrow,
  title,
  em,
  subtitle,
  preset = "",
  successTitle,
  successEm,
  successBody,
  sendLabel,
  sendingLabel,
  minChars = 20,
  onSend,
  onClose,
}: ContactRequestModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [message, setMessage] = useState(preset);
  const timerFlow = useSubmitFlow();
  const [customSending, setCustomSending] = useState(false);
  const [customDone, setCustomDone] = useState(false);
  const valid = message.trim().length >= minChars;
  const firstName = toName.split(" ")[0];
  const remaining = minChars - message.trim().length;
  const sending = onSend ? customSending : timerFlow.sending;
  const done = onSend ? customDone : timerFlow.done;

  const submit = async () => {
    if (!onSend) {
      timerFlow.submit();
      return;
    }
    setCustomSending(true);
    try {
      await onSend(message.trim());
      setCustomDone(true);
    } catch {
      showToast(t("economy:contactRequest.sendError"), "error");
    } finally {
      setCustomSending(false);
    }
  };

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={
            successTitle ?? t("economy:contactRequest.defaultSuccessTitle")
          }
          em={successEm ?? t("economy:contactRequest.defaultSuccessEm")}
          onClose={onClose}
          closeLabel={t("economy:contactRequest.done")}
        >
          {successBody ?? (
            <Translation
              i18nKey="economy:contactRequest.defaultSuccessBody"
              values={{ firstName }}
              components={{ strong: <strong /> }}
            />
          )}
        </SuccessPanel>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) void submit();
          }}
        >
          {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
          <h2 className={styles.title}>
            {title ?? t("economy:contactRequest.defaultTitle")}{" "}
            <em>{em ?? t("economy:contactRequest.defaultEm")}</em>
          </h2>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}

          <div className={styles.field}>
            <label htmlFor="cr-msg">
              {t("economy:contactRequest.messageLabel")}
            </label>
            <textarea
              id="cr-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("economy:contactRequest.messagePlaceholder")}
            />
          </div>
          <p className={styles.note}>
            {remaining > 0
              ? t("economy:contactRequest.charsNeeded", { count: remaining })
              : t("economy:contactRequest.looksGood")}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button
              type="button"
              className={styles.back}
              onClick={onClose}
              disabled={sending}
            >
              {t("economy:contactRequest.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={!valid || sending}
            >
              {sending ? (
                <Sending
                  label={
                    sendingLabel ??
                    t("economy:contactRequest.defaultSendingLabel")
                  }
                />
              ) : (
                (sendLabel ?? t("economy:contactRequest.defaultSendLabel"))
              )}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
