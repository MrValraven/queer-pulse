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

export type RestrictDurationId = "24h" | "7d" | "30d" | "permanent";
type ScopeId = "community" | "platform";
export type RestrictReasonId =
  | "harassment"
  | "misgendering"
  | "hostile"
  | "other";

const DURATION_IDS: RestrictDurationId[] = ["24h", "7d", "30d", "permanent"];
const SCOPE_IDS: ScopeId[] = ["community", "platform"];
const REASON_IDS: RestrictReasonId[] = [
  "harassment",
  "misgendering",
  "hostile",
  "other",
];

/** FE duration id → the backend's `duration` string. `permanent` sends no
 *  duration, which the backend reads as a permanent ban. */
export const RESTRICT_DURATION_TO_API: Record<
  RestrictDurationId,
  string | undefined
> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  permanent: undefined,
};

/** FE reason id → a shared reason-catalogue code the backend accepts
 *  (`@IsIn(REASON_CODES)`). "Misgendering / deadnaming" maps to the catalogue's
 *  `discrimination` ("Discrimination or misgendering"); "hostile" to
 *  `harassment`. */
export const RESTRICT_REASON_TO_CODE: Record<RestrictReasonId, string> = {
  harassment: "harassment",
  misgendering: "discrimination",
  hostile: "harassment",
  other: "other",
};

/** The values the drawer needs to compose either the demo toast (labels) or the
 *  live `POST /admin/members/:id/restrict` body (ids). */
export interface RestrictSelection {
  durationId: RestrictDurationId;
  scopeId: ScopeId;
  reasonId: RestrictReasonId;
  note: string;
  durationLabel: string;
  scopeLabel: string;
}

export function RestrictModal({
  name,
  onClose,
  onApply,
  onMissingReason,
  platformOnly = false,
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
}) {
  const { t } = useTranslation();
  const first = firstName(name);
  const [dur, setDur] = useState<RestrictDurationId>("7d");
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
                    durationLabel: t(
                      `admin:members.restrict.duration.${dur}`,
                    ),
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
