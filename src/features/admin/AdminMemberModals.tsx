import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal, AdminSeg, AdminCheckLine, type AdminSegOption } from "./ui";
import { ADMIN_PROFILE } from "../../shared/components/layout/adminNav.data";
import styles from "./AdminMembersPage.module.css";

const firstName = (full: string) => full.split(" ")[0];

/* ── Message modal ───────────────────────────────────────── */

type SendAsId = "self" | "team";

export function MessageModal({
  name,
  onClose,
  onSend,
}: {
  name: string;
  onClose: () => void;
  onSend: () => void;
}) {
  const { t } = useTranslation();
  const first = firstName(name);
  const SEND_AS: AdminSegOption[] = [
    {
      value: "self",
      label: t("admin:members.message.sendAsSelf", {
        name: ADMIN_PROFILE.firstName,
      }),
    },
    { value: "team", label: t("admin:members.message.sendAsTeam") },
  ];
  const [sendAs, setSendAs] = useState<SendAsId>("self");
  const [body, setBody] = useState("");

  return (
    <AdminModal
      onClose={onClose}
      eyebrow={t("admin:members.message.eyebrow")}
      title={
        <Translation
          i18nKey="admin:members.message.title"
          components={{ em: <em /> }}
          values={{ name: first }}
        />
      }
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="primary" size="md" onClick={onSend}>
            {t("admin:members.message.sendCta")}
          </Button>
        </>
      }
    >
      <label className={styles.fieldLabel}>
        {t("admin:members.message.sendAsLabel")}
      </label>
      <AdminSeg
        options={SEND_AS}
        value={sendAs}
        onChange={(v) => setSendAs(v as SendAsId)}
      />

      <label className={styles.fieldLabel} htmlFor="msg-body">
        {t("admin:members.message.bodyLabel")}
      </label>
      <textarea
        id="msg-body"
        className={styles.textarea}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("admin:members.message.placeholder", { name: first })}
        rows={4}
      />

      <p className={styles.transparency}>
        {t("admin:members.message.transparency", { name: first })}
      </p>
    </AdminModal>
  );
}

/* ── Restrict modal ──────────────────────────────────────── */

type DurationId = "24h" | "7d" | "30d" | "permanent";
type ScopeId = "community" | "platform";
type RestrictReasonId = "harassment" | "misgendering" | "hostile" | "other";

const DURATION_IDS: DurationId[] = ["24h", "7d", "30d", "permanent"];
const SCOPE_IDS: ScopeId[] = ["community", "platform"];
const REASON_IDS: RestrictReasonId[] = [
  "harassment",
  "misgendering",
  "hostile",
  "other",
];

export function RestrictModal({
  name,
  onClose,
  onApply,
  onMissingReason,
}: {
  name: string;
  onClose: () => void;
  /** Passes already-translated labels — the caller only composes a toast with
   *  them, so a language switch mid-session can never corrupt stored state. */
  onApply: (durationLabel: string, scopeLabel: string) => void;
  onMissingReason: () => void;
}) {
  const { t } = useTranslation();
  const first = firstName(name);
  const [dur, setDur] = useState<DurationId>("7d");
  const [scope, setScope] = useState<ScopeId>("community");
  const [reason, setReason] = useState<RestrictReasonId | null>(null);
  const [note, setNote] = useState("");

  const durationOptions: AdminSegOption[] = DURATION_IDS.map((id) => ({
    value: id,
    label: t(`admin:members.restrict.duration.${id}`),
  }));
  const scopeOptions: AdminSegOption[] = SCOPE_IDS.map((id) => ({
    value: id,
    label: t(
      `admin:members.restrict.scope.${id === "community" ? "community" : "platform"}`,
    ),
  }));

  return (
    <AdminModal
      onClose={onClose}
      eyebrow={t("admin:members.restrict.eyebrow")}
      title={
        <Translation
          i18nKey="admin:members.restrict.title"
          components={{ em: <em /> }}
          values={{ name: first }}
        />
      }
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() =>
              reason
                ? onApply(
                    t(`admin:members.restrict.duration.${dur}`),
                    t(`admin:members.restrict.scope.${scope}`),
                  )
                : onMissingReason()
            }
          >
            {t("admin:members.restrict.applyCta")}
          </Button>
        </>
      }
    >
      <label className={styles.fieldLabel}>
        {t("admin:members.restrict.durationLabel")}
      </label>
      <AdminSeg options={durationOptions} value={dur} onChange={(v) => setDur(v as DurationId)} />

      <label className={styles.fieldLabel}>
        {t("admin:members.restrict.scopeLabel")}
      </label>
      <AdminSeg options={scopeOptions} value={scope} onChange={(v) => setScope(v as ScopeId)} />

      <label className={styles.fieldLabel}>
        {t("admin:members.restrict.reasonLabel")}
      </label>
      <div className={styles.reasonList}>
        {REASON_IDS.map((id) => (
          <AdminCheckLine
            key={id}
            checked={reason === id}
            onChange={() => setReason(id)}
            title={t(`admin:members.restrict.reason.${id}`)}
          />
        ))}
      </div>

      <textarea
        className={styles.textarea}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("admin:members.restrict.notePlaceholder", { name: first })}
        rows={3}
      />

      <p className={styles.transparency}>
        {t("admin:members.restrict.transparency", { name: first })}
      </p>
    </AdminModal>
  );
}
