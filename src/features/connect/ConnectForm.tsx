import { FormField, Select, type AvatarTint } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FirstContactComposer } from "../messages/FirstContactComposer";
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
  /** The member's own "open to" entries, offered above the generic reasons. */
  openTo?: OpenToEntry[];
};

/**
 * The reach-out form.
 *
 * CONTROLLED, deliberately (PRD-03). The field state used to live here, so a
 * refusal that replaced this form with a notice panel destroyed whatever the
 * member had written. It now lives in `ConnectModal`, which outlives every
 * panel the send can end on, and this component renders it.
 *
 * The identity header, status line, safety notice, message field/counter,
 * and footer are ALL owned by the shared `FirstContactComposer` (PRD-340,
 * door="connect"); this component contributes only what's genuinely its
 * own: the "Say hello." title and the "what's this about?" reason picker,
 * passed in as `heading`/`extraFields`.
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

  return (
    <FirstContactComposer
      door="connect"
      target={{
        name: `${member.first} ${member.last}`.trim(),
        initials: member.initials,
        tint: member.tint,
        avatarUrl: member.photo,
      }}
      heading={
        <h1 className={styles.title}>
          <Translation
            i18nKey="connect:form.title"
            components={{ em: <em /> }}
          />
        </h1>
      }
      extraFields={
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
      }
      message={message}
      onMessageChange={onMessageChange}
      isSending={sending}
      error={error}
      onSubmit={() => onSubmit(message.trim(), reason)}
      onBack={onClose}
      backLabel={t("connect:form.cancel")}
    />
  );
}
