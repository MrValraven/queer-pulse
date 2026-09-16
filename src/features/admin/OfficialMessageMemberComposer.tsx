import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  OFFICIAL_RECIPIENT_NOT_FOUND_CODE,
  officialMessagesErrorCode,
  type OfficialRecipientDTO,
} from "./api/adminOfficialMessages.api";
import { useSendOfficialMessage } from "./api/useAdminOfficialMessages";
import { OfficialMessageBodyField } from "./OfficialMessageBodyField";
import { OfficialRecipientPicker } from "./OfficialRecipientPicker";
import styles from "./AdminOfficialMessagesPage.module.css";

/**
 * "Message one member": pick a member, write, send. The message lands in
 * their official QueerPulse thread, pinned at the top of their inbox and
 * never pushed to their phone (official threads are push-suppressed).
 */
export function OfficialMessageMemberComposer() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [recipient, setRecipient] = useState<OfficialRecipientDTO | null>(null);
  const [body, setBody] = useState("");
  const sendMutation = useSendOfficialMessage();
  const canSend =
    recipient !== null && body.trim().length > 0 && !sendMutation.isPending;

  const handleSend = () => {
    if (!recipient || !canSend) return;
    sendMutation.mutate(
      { recipient, body: body.trim() },
      {
        onSuccess: () => {
          showToast(
            t("admin:officialMessages.member.sent", { name: recipient.name }),
            "success",
          );
          setBody("");
        },
        onError: (error) => {
          const isRecipientGone =
            officialMessagesErrorCode(error) ===
            OFFICIAL_RECIPIENT_NOT_FOUND_CODE;
          if (isRecipientGone) setRecipient(null);
          showToast(
            t(
              isRecipientGone
                ? "admin:officialMessages.member.recipientGone"
                : "admin:officialMessages.member.sendFailed",
            ),
            "error",
          );
        },
      },
    );
  };

  return (
    <section
      className={styles.panel}
      aria-labelledby="official-member-composer-title"
    >
      <h2 id="official-member-composer-title" className={styles.panelTitle}>
        {t("admin:officialMessages.member.title")}
      </h2>
      <p className={styles.panelSub}>
        {t("admin:officialMessages.member.subtitle")}
      </p>
      <OfficialRecipientPicker selected={recipient} onSelect={setRecipient} />
      <OfficialMessageBodyField
        label={t("admin:officialMessages.member.bodyLabel")}
        placeholder={t("admin:officialMessages.member.bodyPlaceholder")}
        value={body}
        onChange={setBody}
      />
      <div className={styles.panelActions}>
        <Button variant="primary" onClick={handleSend} disabled={!canSend}>
          <FiSend aria-hidden />
          {sendMutation.isPending
            ? t("admin:officialMessages.member.sending")
            : t("admin:officialMessages.member.send")}
        </Button>
      </div>
    </section>
  );
}
