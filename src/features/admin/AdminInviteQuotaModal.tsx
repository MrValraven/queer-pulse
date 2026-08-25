import { useState } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import { useUpdateInviteQuota } from "./api/useAdminInvites";
import type { AdminInviteInviterDTO } from "./api/adminInvites.api";
import styles from "./AdminInvitesPage.module.css";

/**
 * One inviter's quota override row: a number input (empty = "use the
 * platform default"), a Save button, and — only once an override is set — a
 * Clear button that resets it back to the default. `draftQuota` seeds once
 * from `inviter.inviteMonthlyQuota` and is otherwise only ever written by
 * this row's own Save/Clear, so there is no server-value-changed-elsewhere
 * case to reconcile and no seed-then-draft effect is needed.
 */
function AdminInviteQuotaRow({ inviter }: { inviter: AdminInviteInviterDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateInviteQuota = useUpdateInviteQuota();
  const [draftQuota, setDraftQuota] = useState(
    inviter.inviteMonthlyQuota === null
      ? ""
      : String(inviter.inviteMonthlyQuota),
  );

  const hasOverride = inviter.inviteMonthlyQuota !== null;
  const inputId = `admin-invite-quota-${inviter.slug}`;

  function handleSave() {
    const trimmedQuota = draftQuota.trim();
    const parsedQuota = trimmedQuota === "" ? null : Number(trimmedQuota);
    if (
      parsedQuota !== null &&
      (!Number.isInteger(parsedQuota) || parsedQuota < 0)
    ) {
      showToast(t("admin:adminInvites.quota.invalid"), "error");
      return;
    }
    updateInviteQuota.mutate(
      { slug: inviter.slug, quota: parsedQuota },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminInvites.quota.saved", { name: inviter.name }),
            "success",
          );
        },
      },
    );
  }

  function handleClear() {
    setDraftQuota("");
    updateInviteQuota.mutate(
      { slug: inviter.slug, quota: null },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminInvites.quota.cleared", { name: inviter.name }),
            "success",
          );
        },
      },
    );
  }

  return (
    <div className={styles.quotaRow}>
      <div className={styles.quotaRowInfo}>
        <span className={styles.quotaRowName}>{inviter.name}</span>
        <span className={styles.quotaRowCount}>
          {t("admin:adminInvites.quota.sentCount", { count: inviter.count })}
        </span>
      </div>
      <div className={styles.quotaRowControls}>
        <label className={styles.quotaField} htmlFor={inputId}>
          <span className={styles.quotaFieldLabel}>
            {t("admin:adminInvites.quota.fieldLabel")}
          </span>
          <input
            id={inputId}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className={styles.quotaInput}
            placeholder={t("admin:adminInvites.quota.defaultPlaceholder")}
            value={draftQuota}
            onChange={(event) => setDraftQuota(event.target.value)}
            aria-label={t("admin:adminInvites.quota.inputAriaLabel", {
              name: inviter.name,
            })}
          />
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={updateInviteQuota.isPending}
          aria-label={t("admin:adminInvites.quota.saveAriaLabel", {
            name: inviter.name,
          })}
        >
          {t("admin:adminInvites.quota.saveCta")}
        </Button>
        {hasOverride && (
          <button
            type="button"
            className={styles.quotaClearButton}
            onClick={handleClear}
            disabled={updateInviteQuota.isPending}
            aria-label={t("admin:adminInvites.quota.clearAriaLabel", {
              name: inviter.name,
            })}
            title={t("admin:adminInvites.quota.clearCta")}
          >
            <FiRotateCcw aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * "Manage invite quotas" modal opened from the invite oversight page's
 * header action. Lists every known inviter (the same list backing the "sent
 * by" filter) with an editable monthly invite quota override per row — the
 * only admin surface for `User.inviteMonthlyQuota`, previously a direct
 * database edit.
 */
export function AdminInviteQuotaModal({
  inviters,
  onClose,
}: {
  inviters: AdminInviteInviterDTO[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminModal
      eyebrow={t("admin:adminInvites.quota.modalEyebrow")}
      title={t("admin:adminInvites.quota.modalTitle")}
      onClose={onClose}
      wide
    >
      <p className={styles.quotaHint}>
        {t("admin:adminInvites.quota.modalHint")}
      </p>
      <div className={styles.quotaList}>
        {inviters.map((inviter) => (
          <AdminInviteQuotaRow key={inviter.slug} inviter={inviter} />
        ))}
      </div>
    </AdminModal>
  );
}
