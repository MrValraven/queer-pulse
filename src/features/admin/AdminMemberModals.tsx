import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AdminModal,
  AdminSeg,
  AdminCheckLine,
  type AdminSegOption,
} from "./ui";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import type {
  RestrictDurationId,
  RestrictReasonId,
  RestrictSelection,
} from "./adminMemberModals.utils";
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
  // DES-160, the same leak as the dashboard greeting one modal over: this
  // label read `ADMIN_PROFILE.firstName` off the mock member registry, so a
  // real admin was offered "send as Tiago" as the account they would be
  // speaking from. `useAccountIdentity` resolves the signed-in member and
  // returns the fixture persona only in demo mode, where that persona IS the
  // signed-in member. While the profile is still resolving it hands back an
  // empty string, so the option reads plainly as "You" rather than naming the
  // wrong person or leaving a hole where a name belongs.
  const { firstName: signedInFirstName } = useAccountIdentity();
  const SEND_AS: AdminSegOption[] = [
    {
      value: "self",
      label: signedInFirstName
        ? t("admin:members.message.sendAsSelf", { name: signedInFirstName })
        : t("admin:members.message.sendAsSelfNameless"),
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

type ScopeId = "community" | "platform";

const DURATION_IDS: RestrictDurationId[] = ["24h", "7d", "30d", "permanent"];
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
  platformOnly = false,
  initialDuration = "7d",
}: {
  name: string;
  onClose: () => void;
  /** Passes the raw selection so the caller can send the live restriction, plus
   *  already-translated labels for the demo toast — resolving the labels here
   *  means a language switch mid-session can never corrupt stored state. */
  onApply: (selection: RestrictSelection) => void;
  onMissingReason: () => void;
  /** Live mode has no community-scoped restriction backend, so the scope is
   *  locked to platform-wide (the only thing the endpoint can honestly do)
   *  rather than offering a "This community" option that silently acts
   *  platform-wide. Demo keeps both scopes for the prototype. */
  platformOnly?: boolean;
  /** Which duration the modal opens on. The drawer's permanent-ban action
   *  opens straight on `permanent`, which sends no `duration` and so bans the
   *  account for good; every other entry point starts at the 7-day default. */
  initialDuration?: RestrictDurationId;
}) {
  const { t } = useTranslation();
  const first = firstName(name);
  const [dur, setDur] = useState<RestrictDurationId>(initialDuration);
  const [scope, setScope] = useState<ScopeId>(
    platformOnly ? "platform" : "community",
  );
  const [reason, setReason] = useState<RestrictReasonId | null>(null);
  const [note, setNote] = useState("");

  const scopeIds = platformOnly ? (["platform"] as ScopeId[]) : SCOPE_IDS;
  const durationOptions: AdminSegOption[] = DURATION_IDS.map((id) => ({
    value: id,
    label: t(`admin:members.restrict.duration.${id}`),
  }));
  const scopeOptions: AdminSegOption[] = scopeIds.map((id) => ({
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
                ? onApply({
                    durationId: dur,
                    scopeId: scope,
                    reasonId: reason,
                    note,
                    durationLabel: t(`admin:members.restrict.duration.${dur}`),
                    scopeLabel: t(`admin:members.restrict.scope.${scope}`),
                  })
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
      <AdminSeg
        options={durationOptions}
        value={dur}
        onChange={(v) => setDur(v as RestrictDurationId)}
      />
      {/* "Permanent" sends no duration, i.e. a ban with no end date. Say so
          plainly rather than letting it read as one more restriction length. */}
      {dur === "permanent" && (
        <p className={styles.transparency}>
          {t("admin:members.restrict.permanentNote", { name: first })}
        </p>
      )}

      <label className={styles.fieldLabel}>
        {t("admin:members.restrict.scopeLabel")}
      </label>
      <AdminSeg
        options={scopeOptions}
        value={scope}
        onChange={(v) => setScope(v as ScopeId)}
      />

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
        aria-label={t("admin:members.restrict.notePlaceholder", {
          name: first,
        })}
        placeholder={t("admin:members.restrict.notePlaceholder", {
          name: first,
        })}
        rows={3}
      />

      <p className={styles.transparency}>
        {t("admin:members.restrict.transparency", { name: first })}
      </p>
    </AdminModal>
  );
}
