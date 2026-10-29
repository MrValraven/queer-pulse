import { useId, useState } from "react";
import { FiCheck, FiMail, FiRepeat } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useSendWelcomeEmail } from "../api/useSendWelcomeEmail";
import type { JoinRequestView } from "../api/useJoinRequests";
import { AdminSeg } from "../ui";
import { welcomeEmailSendErrorMessage } from "./welcomeEmailSendError";
import styles from "./WelcomeEmailSendGroup.module.css";

const EMAIL_LANGUAGES: readonly Language[] = ["en", "pt"];

/**
 * Sends the welcome email for one approved applicant from here. The reviewer
 * picks the email language (their own app language to start with) and presses
 * "Send welcome email": the backend sends the published Resend template to the
 * address on the join request, and the toast and the card both name that
 * address. A reviewer who prefers to write the email themselves still has the
 * invite link's copy button above this group.
 *
 * After a send the group folds into a "Sent to {email}" line with a "Send
 * again" button that brings the language choice back. A refusal shows as a
 * toast and an inline line, each naming the specific cause. Hidden unless the
 * invite still works.
 */
export function WelcomeEmailSendGroup({ item }: { item: JoinRequestView }) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const sendWelcomeEmail = useSendWelcomeEmail();
  const languageLabelId = useId();
  const [chosenLanguage, setChosenLanguage] = useState<Language | null>(null);
  // The invite the last send was made for, so a "Sent" line cannot outlive
  // the invite it describes when a new code is issued.
  const [sentInviteCode, setSentInviteCode] = useState<string | null>(null);
  // Kept after the line folds away so the text does not empty mid-animation.
  const [failureMessage, setFailureMessage] = useState("");
  const [isFailureShown, setIsFailureShown] = useState(false);

  const isUsable = Boolean(item.inviteCode) && item.inviteStatus === "valid";
  if (!isUsable) return null;

  const emailLanguage = chosenLanguage ?? language;
  const isSending = sendWelcomeEmail.isPending;
  const isSent = sentInviteCode !== null && sentInviteCode === item.inviteCode;

  function send() {
    if (isSending) return;
    setIsFailureShown(false);
    sendWelcomeEmail.mutate(
      { id: item.id, locale: emailLanguage },
      {
        onSuccess: () => {
          setSentInviteCode(item.inviteCode);
          showToast(
            t("admin:emailTemplates.send.sentToast", { email: item.email }),
            "success",
          );
        },
        onError: (error) => {
          const message = welcomeEmailSendErrorMessage(error, t);
          setFailureMessage(message);
          setIsFailureShown(true);
          showToast(message, "error");
        },
      },
    );
  }

  return (
    <div className={styles.group}>
      <Collapse isOpen={isSent}>
        <div className={styles.sent}>
          <p className={styles.sentLine} role="status">
            <FiCheck aria-hidden />
            {t("admin:emailTemplates.send.sentTo", { email: item.email })}
          </p>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setSentInviteCode(null)}
          >
            <FiRepeat aria-hidden />
            {t("admin:emailTemplates.send.sendAgainCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={!isSent}>
        <div className={styles.form}>
          <div className={styles.control}>
            <span id={languageLabelId} className={styles.controlLabel}>
              {t("admin:emailTemplates.copy.languageLabel")}
            </span>
            <AdminSeg
              ariaLabelledby={languageLabelId}
              value={emailLanguage}
              onChange={(value) =>
                setChosenLanguage(value === "pt" ? "pt" : "en")
              }
              options={EMAIL_LANGUAGES.map((code) => ({
                value: code,
                label: t(`admin:emailTemplates.editor.localeTab.${code}`),
              }))}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            className={styles.sendAction}
            disabled={isSending}
            aria-busy={isSending}
            onClick={send}
          >
            <FiMail aria-hidden />
            {isSending
              ? t("admin:emailTemplates.send.sending")
              : t("admin:emailTemplates.send.cta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={isFailureShown}>
        <p className={styles.failure} role="status">
          {failureMessage}
        </p>
      </Collapse>
    </div>
  );
}
