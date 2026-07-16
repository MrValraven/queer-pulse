import { useState, type FormEvent } from "react";
import {
  Avatar,
  Button,
  FormField,
  Sending,
  type AvatarTint,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EMAIL_RE, REASONS } from "./connectModal.data";
import styles from "./ConnectModal.module.css";

type FormMember = {
  first: string;
  last: string;
  role: string;
  initials: string;
  tint?: AvatarTint;
  photo?: string;
};

/** The reach-out form. Owns its field state; tells the parent when a valid
 *  message is submitted so the parent can simulate delivery. */
export function ConnectForm({
  member,
  sending,
  onSubmit,
  onClose,
}: {
  member: FormMember;
  sending: boolean;
  onSubmit: (message: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const canSend =
    name.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    message.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend || sending) return;
    onSubmit(message.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.toRow}>
        <Avatar
          initials={member.initials}
          tint={member.tint}
          size={56}
          src={member.photo}
          alt={`${member.first} ${member.last}`}
        />
        <div>
          <div className={styles.toName}>
            {member.first} {member.last}
          </div>
          <div className={styles.toRole}>{member.role}</div>
        </div>
      </div>

      <h1 className={styles.title}>
        <Translation i18nKey="connect:form.title" components={{ em: <em /> }} />
      </h1>
      <p className={styles.sub}>{t("connect:form.sub")}</p>

      <FormField label={t("connect:form.nameLabel")} required>
        <input
          id="connect-name"
          type="text"
          placeholder={t("connect:form.namePlaceholder")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={sending}
        />
      </FormField>
      <FormField label={t("connect:form.emailLabel")} required>
        <input
          id="connect-email"
          type="email"
          placeholder={t("connect:form.emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={sending}
        />
      </FormField>
      <FormField label={t("connect:form.reasonLabel")}>
        <select
          id="connect-about"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={sending}
        >
          <option value="">{t("connect:form.reasonPlaceholder")}</option>
          {REASONS.map((reasonOption) => (
            <option key={reasonOption.id} value={reasonOption.id}>
              {t(reasonOption.labelKey)}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label={t("connect:form.messageLabel")} required>
        <textarea
          id="connect-msg"
          placeholder={t("connect:form.messagePlaceholder")}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={sending}
        />
      </FormField>

      <div className={styles.note}>{t("connect:form.note")}</div>

      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          onClick={onClose}
          disabled={sending}
        >
          ← {t("connect:form.cancel")}
        </button>
        <Button size="lg" type="submit" disabled={!canSend || sending}>
          {sending ? (
            <Sending label={t("connect:form.sendingLabel")} />
          ) : (
            <>{t("connect:form.send")} →</>
          )}
        </Button>
      </div>
    </form>
  );
}
