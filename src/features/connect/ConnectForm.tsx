import { type FormEvent } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import {
  Avatar,
  Button,
  FormField,
  Select,
  Sending,
  type AvatarTint,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  openToLabel,
  reasonValue,
  type OpenToEntry,
} from "../members/openTo.data";
import { REASONS } from "./connectModal.data";
import styles from "./ConnectModal.module.css";

type FormMember = {
  first: string;
  last: string;
  role: string;
  initials: string;
  tint?: AvatarTint;
  photo?: string;
  /** The member's own "open to" entries — offered above the generic reasons. */
  openTo?: OpenToEntry[];
};

/**
 * The reach-out form.
 *
 * CONTROLLED, deliberately (PRD-03). The field state used to live here, so a
 * refusal that replaced this form with a notice panel destroyed whatever the
 * member had written. It now lives in `ConnectModal`, which outlives every
 * panel the send can end on, and this component renders it.
 */
export function ConnectForm({
  member,
  reason,
  message,
  sending,
  error,
  onReasonChange,
  onMessageChange,
  onSubmit,
  onClose,
}: {
  member: FormMember;
  /** The chosen reason (seeded from an "open to" chip), owned by the parent. */
  reason: string;
  /** What the member has written so far, owned by the parent. */
  message: string;
  sending: boolean;
  /** A failed send message to surface above the footer; null when all is well. */
  error?: string | null;
  onReasonChange: (reason: string) => void;
  onMessageChange: (message: string) => void;
  onSubmit: (message: string, reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const memberOpenTo = member.openTo ?? [];

  const canSend = message.trim().length > 0;

  const openToGroupLabel = t("connect:form.reasonOpenToGroup", {
    first: member.first,
  });
  const genericGroupLabel = t("connect:form.reasonGenericGroup");
  const reasonOptions = [
    ...memberOpenTo.map((entry) => ({
      value: reasonValue(entry),
      label: openToLabel(entry, t),
      group: openToGroupLabel,
    })),
    ...REASONS.map((reasonOption) => ({
      value: reasonOption.id,
      label: t(reasonOption.labelKey),
      group: genericGroupLabel,
    })),
  ];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend || sending) return;
    onSubmit(message.trim(), reason);
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

      <FormField label={t("connect:form.reasonLabel")}>
        <Select
          id="connect-about"
          placeholder={t("connect:form.reasonPlaceholder")}
          value={reason || null}
          onChange={(value) => onReasonChange(value ?? "")}
          disabled={sending}
          options={reasonOptions}
        />
      </FormField>
      <FormField label={t("connect:form.messageLabel")} required>
        <textarea
          id="connect-msg"
          placeholder={t("connect:form.messagePlaceholder")}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          disabled={sending}
        />
      </FormField>

      <div className={styles.note}>{t("connect:form.note")}</div>

      {error && (
        <p className={styles.sendError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          onClick={onClose}
          disabled={sending}
        >
          <FiArrowLeft aria-hidden /> {t("connect:form.cancel")}
        </button>
        <Button size="lg" type="submit" disabled={!canSend || sending}>
          {sending ? (
            <Sending label={t("connect:form.sendingLabel")} />
          ) : (
            <>
              {t("connect:form.send")} <FiArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
