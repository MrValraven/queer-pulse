import { AdminSeg } from "./ui";
import { DatePicker } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SafeSpaceStatus } from "./api/adminSafeSpaces.api";
import {
  AdminSafeSpacePromiseFields,
  AdminSafeSpaceVouchFields,
} from "./AdminSafeSpaceModalLists";
import type { SafeSpaceFormDraft } from "./adminSafeSpaceModal.utils";
import styles from "./AdminSafeSpaceModal.module.css";

const STATUS_VALUES: SafeSpaceStatus[] = ["none", "verified", "removed"];

/**
 * The safe-space profile form body: status, tier, verifier, re-verified
 * date, subheading, repeatable promises/vouches, and (when removing) a
 * reason. Split out of `AdminSafeSpaceModal` so that component — which also
 * owns the profile-loading/seeding logic — stays under the 200-line limit.
 */
export function AdminSafeSpaceModalFields({
  draft,
  onChange,
}: {
  draft: SafeSpaceFormDraft;
  onChange: (patch: Partial<SafeSpaceFormDraft>) => void;
}) {
  const { t } = useTranslation();
  const statusOptions = STATUS_VALUES.map((statusValue) => ({
    value: statusValue,
    label: t(`admin:adminSafeSpaces.status.${statusValue}`),
  }));

  return (
    <>
      <label className={styles.fieldLabel}>
        {t("admin:adminSafeSpaces.modal.statusLabel")}
      </label>
      <AdminSeg
        options={statusOptions}
        value={draft.status}
        onChange={(value) => onChange({ status: value as SafeSpaceStatus })}
      />

      <label className={styles.fieldLabel} htmlFor="safe-space-tier">
        {t("admin:adminSafeSpaces.modal.tierLabel")}
      </label>
      <input
        id="safe-space-tier"
        type="number"
        className={styles.numberInput}
        value={draft.tier}
        onChange={(event) => onChange({ tier: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="safe-space-verifier">
        {t("admin:adminSafeSpaces.modal.verifierLabel")}
      </label>
      <input
        id="safe-space-verifier"
        className={styles.textInput}
        value={draft.verifier}
        onChange={(event) => onChange({ verifier: event.target.value })}
      />

      <label id="safe-space-reverified-label" className={styles.fieldLabel}>
        {t("admin:adminSafeSpaces.modal.reVerifiedAtLabel")}
      </label>
      <DatePicker
        mode="date"
        id="safe-space-reverified"
        labelledBy="safe-space-reverified-label"
        value={draft.reVerifiedAt || null}
        onChange={(value) => onChange({ reVerifiedAt: value ?? "" })}
      />

      <label className={styles.fieldLabel} htmlFor="safe-space-sub">
        {t("admin:adminSafeSpaces.modal.subLabel")}
      </label>
      <textarea
        id="safe-space-sub"
        className={styles.textarea}
        rows={2}
        value={draft.sub}
        onChange={(event) => onChange({ sub: event.target.value })}
      />

      <AdminSafeSpacePromiseFields
        promises={draft.promises}
        onChange={(promises) => onChange({ promises })}
      />
      <AdminSafeSpaceVouchFields
        vouches={draft.vouches}
        onChange={(vouches) => onChange({ vouches })}
      />

      {draft.status === "removed" && (
        <>
          <label className={styles.fieldLabel} htmlFor="safe-space-reason">
            {t("admin:adminSafeSpaces.modal.reasonLabel")}
          </label>
          <textarea
            id="safe-space-reason"
            className={styles.textarea}
            rows={3}
            value={draft.reason}
            onChange={(event) => onChange({ reason: event.target.value })}
          />
          <p className={styles.hint}>
            {t("admin:adminSafeSpaces.modal.reasonHint")}
          </p>
        </>
      )}
    </>
  );
}
