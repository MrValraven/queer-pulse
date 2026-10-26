import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminInviteBulkAction } from "./api/adminInvites.api";
import styles from "./AdminInvitesPage.module.css";

export interface AdminInviteBulkConfirmRequest {
  action: AdminInviteBulkAction;
  /** How many selected invites the action applies to. */
  eligibleCount: number;
  /** How many selected invites it leaves as they are. */
  ineligibleCount: number;
}

/**
 * The confirm step for a bulk refresh or revoke from the invite selection
 * bar, through the shared `ConfirmDialog`. Refresh uses the jade positive
 * tone, the same as the bar's Refresh button, since a refreshed link can be
 * revoked again; revoke uses the destructive tone and says it cannot be
 * undone. The description names how many invites the action takes and, when
 * some selected invites do not qualify, a second line says how many are left
 * as they are.
 */
export function AdminInviteBulkConfirm({
  request,
  isOpen,
  isPending,
  onConfirm,
  onClose,
}: {
  /** What the dialog asks about, snapshotted when it opened, so its copy
   *  holds steady while the selection behind it changes. */
  request: AdminInviteBulkConfirmRequest;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: (action: AdminInviteBulkAction) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { action, eligibleCount, ineligibleCount } = request;

  return (
    <ConfirmDialog
      open={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(action)}
      tone={action === "revoke" ? "destructive" : "positive"}
      loading={isPending}
      title={t(`admin:adminInvites.bulk.${action}ConfirmTitle`, {
        count: eligibleCount,
      })}
      description={t(`admin:adminInvites.bulk.${action}ConfirmBody`, {
        count: eligibleCount,
      })}
      confirmLabel={t(`admin:adminInvites.bulk.${action}ConfirmCta`, {
        count: eligibleCount,
      })}
    >
      {ineligibleCount > 0 && (
        <p className={styles.bulkConfirmNote}>
          {t(`admin:adminInvites.bulk.${action}LeftAsTheyAre`, {
            count: ineligibleCount,
          })}
        </p>
      )}
    </ConfirmDialog>
  );
}
