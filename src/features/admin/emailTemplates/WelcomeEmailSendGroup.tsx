import { useId, useState } from "react";
import { FiMail } from "react-icons/fi";
import { Button, Collapse, ConfirmDialog } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useSendWelcomeEmail,
  type WelcomeEmailSent,
} from "../api/useSendWelcomeEmail";
import type { JoinRequestView } from "../api/useJoinRequests";
import { useJoinRequestShortDate } from "../joinRequestShortDate";
import { AdminSeg } from "../ui";
import { welcomeEmailSendErrorMessage } from "./welcomeEmailSendError";
import { WelcomeEmailSendStatus } from "./WelcomeEmailSendStatus";
import styles from "./WelcomeEmailSendGroup.module.css";

const EMAIL_LANGUAGES: readonly Language[] = ["en", "pt"];

/**
 * Sends the welcome email for one approved applicant from here. The reviewer
 * picks the email language (their own app language to start with) and presses
 * "Send welcome email": the backend sends the published Resend template to the
 * address on the join request, and the toast names that address. A reviewer
 * who prefers to write the email themselves still has the invite link's copy
 * button above this group.
 *
 * A status line on top says whether the email already went out, how many
 * times, and when last, read from the server's send record, so it holds after
 * a reload. Once one went out the button reads "Send again" and asks first in
 * a dialog that names the count, the address and the language, because every
 * send puts another copy in the applicant's inbox. A refusal shows as a toast
 * and an inline line, each naming the specific cause. Hidden unless the invite
 * still works.
 */
export function WelcomeEmailSendGroup({ item }: { item: JoinRequestView }) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const sendWelcomeEmail = useSendWelcomeEmail();
  const shortDate = useJoinRequestShortDate();
  const languageLabelId = useId();
  const [chosenLanguage, setChosenLanguage] = useState<Language | null>(null);
  // This card's own latest send. The queue's just-approved card is held in
  // session state that the cache patch cannot reach, so it reads its count
  // from here until the row it was handed carries a newer one.
  const [latestSend, setLatestSend] = useState<
    (WelcomeEmailSent & { id: string }) | null
  >(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // Kept after the line folds away so the text does not empty mid-animation.
  const [failureMessage, setFailureMessage] = useState("");
  const [isFailureShown, setIsFailureShown] = useState(false);

  const isUsable = Boolean(item.inviteCode) && item.inviteStatus === "valid";
  if (!isUsable) return null;

  const sendRecord =
    latestSend?.id === item.id &&
    latestSend.welcomeEmailSendCount > item.welcomeEmailSendCount
      ? latestSend
      : item;
  const sendCount = sendRecord.welcomeEmailSendCount;
  const lastSentOn = shortDate(sendRecord.welcomeEmailLastSentAt);
  const hasBeenSent = sendCount > 0;
  const emailLanguage = chosenLanguage ?? language;
  const isSending = sendWelcomeEmail.isPending;

  function requestSend() {
    if (isSending) return;
    if (hasBeenSent) setIsConfirmOpen(true);
    else send();
  }

  function send() {
    setIsConfirmOpen(false);
    if (isSending) return;
    setIsFailureShown(false);
    sendWelcomeEmail.mutate(
      { id: item.id, locale: emailLanguage, previousSendCount: sendCount },
      {
        onSuccess: (sent) => {
          setLatestSend({ id: item.id, ...sent });
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

  const confirmDescription = t(
    lastSentOn
      ? "admin:emailTemplates.send.confirmResend.description"
      : "admin:emailTemplates.send.confirmResend.descriptionUndated",
    {
      count: sendCount,
      email: item.email,
      date: lastSentOn ?? "",
      language: t(`admin:emailTemplates.send.languageName.${emailLanguage}`),
    },
  );

  return (
    <div className={styles.group}>
      <WelcomeEmailSendStatus
        sendCount={sendCount}
        lastSentAt={sendRecord.welcomeEmailLastSentAt}
      />
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
          onClick={requestSend}
        >
          <FiMail aria-hidden />
          {isSending
            ? t("admin:emailTemplates.send.sending")
            : hasBeenSent
              ? t("admin:emailTemplates.send.sendAgainCta")
              : t("admin:emailTemplates.send.cta")}
        </Button>
      </div>
      <Collapse isOpen={isFailureShown}>
        <p className={styles.failure} role="status">
          {failureMessage}
        </p>
      </Collapse>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={send}
        title={t("admin:emailTemplates.send.confirmResend.title")}
        description={confirmDescription}
        confirmLabel={t("admin:emailTemplates.send.sendAgainCta")}
      />
    </div>
  );
}
