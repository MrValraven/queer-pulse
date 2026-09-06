import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToggle } from "./ui";
import { useGrantStaffRole, useRevokeStaffRole } from "./api/useAdminMembers";
import {
  STAFF_ROLES,
  type StaffRoleId,
  type StaffRoleMeta,
} from "./staffRoles.registry";
import type { MemberRole } from "./api/adminMembers.api";
import styles from "./AdminMembersPage.module.css";

/**
 * The exact bounds `POST /admin/members/:id/staff-roles` and
 * `DELETE /admin/members/:id/staff-roles/:role` enforce on `reason` after
 * trimming (PRD-288). Ten rather than the twenty a member-facing moderation
 * note takes, because this text is read by other admins in the audit feed and
 * never by the member it names, and nobody builds an appeal out of it.
 * Mirrored here so the dialog stops the admin while the words are in front of
 * them instead of sending a request that comes back 400.
 */
const STAFF_ROLE_REASON_MIN_LENGTH = 10;
const STAFF_ROLE_REASON_MAX_LENGTH = 500;

/** The change a moderator has asked for and not yet confirmed. */
interface PendingStaffRoleChange {
  staffRole: StaffRoleMeta;
  isGrant: boolean;
}

/**
 * The drawer's staff-role section: additive functional grants (e.g. the
 * magazine desk) layered on top of a member's account tier — see
 * `staffRoles.registry.ts`. One `AdminToggle` per registry entry; the
 * backend owns the real guardrails and answers 403/409 with a reason
 * (surfaced by the global mutation-error toast), so — mirroring
 * `AdminMemberRoleControl` — this only renders the two states it can know
 * locally as a disabled, explained state: a system account (no staff roles
 * at all) and an admin (who already holds every capability implicitly).
 *
 * PRD-288: a toggle no longer files the change. It opens the shared
 * `ConfirmDialog` — the same component and the same interaction the invite
 * revoke, the listing removal and the governance-motion rejection all use —
 * which names the queues the grant opens or closes and takes the admin's
 * reason before anything is sent. A staff grant decides which queues that
 * person can work, and it used to move on one mis-click with nothing recorded
 * about why. The dialog rides on `Modal`, which portals to `document.body`, so
 * its fixed scrim covers the member drawer it is opened from instead of being
 * trapped inside it.
 */
export function AdminMemberStaffRoles({
  memberId,
  slug,
  isSystem,
  role,
  staffRoles,
}: {
  memberId: string;
  slug: string;
  isSystem: boolean;
  role: MemberRole;
  staffRoles: StaffRoleId[];
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const grantStaffRole = useGrantStaffRole();
  const revokeStaffRole = useRevokeStaffRole();
  const [pendingChange, setPendingChange] =
    useState<PendingStaffRoleChange | null>(null);
  const [reason, setReason] = useState("");

  const isAdmin = role === "admin";
  const lockedReason = isSystem
    ? t("admin:staffRoles.systemLocked")
    : isAdmin
      ? t("admin:staffRoles.adminSuperset")
      : null;
  const isPending = grantStaffRole.isPending || revokeStaffRole.isPending;
  const togglesDisabled = isSystem || isAdmin || isPending;

  const closeConfirm = () => {
    setPendingChange(null);
    setReason("");
  };

  const confirmChange = () => {
    if (!pendingChange) return;
    const { staffRole, isGrant } = pendingChange;
    const mutation = isGrant ? grantStaffRole : revokeStaffRole;
    mutation.mutate(
      {
        memberId,
        slug,
        role: staffRole.id,
        isSystem,
        reason: reason.trim(),
      },
      {
        onSuccess: () =>
          showToast(
            t(
              isGrant
                ? "admin:staffRoles.confirm.grantedToast"
                : "admin:staffRoles.confirm.revokedToast",
              { role: t(staffRole.labelKey) },
            ),
            "success",
          ),
      },
    );
    closeConfirm();
  };

  return (
    <div className={styles.staffRolesGroup}>
      <span className={styles.subGroupLabel}>
        {t("admin:staffRoles.grantsLabel")}
      </span>
      {lockedReason && <p className={styles.dHint}>{lockedReason}</p>}
      <ul className={styles.staffRoleList}>
        {STAFF_ROLES.map((staffRole) => {
          const checked = isAdmin || staffRoles.includes(staffRole.id);
          return (
            <li key={staffRole.id} className={styles.staffRoleRow}>
              <div className={styles.staffRoleText}>
                <span className={styles.staffRoleLabel}>
                  {t(staffRole.labelKey)}
                </span>
                <span className={styles.staffRoleDesc}>
                  {t(staffRole.descriptionKey)}
                </span>
              </div>
              <AdminToggle
                checked={checked}
                disabled={togglesDisabled}
                label={t(staffRole.labelKey)}
                onChange={(nextChecked) =>
                  setPendingChange({ staffRole, isGrant: nextChecked })
                }
              />
            </li>
          );
        })}
      </ul>

      {pendingChange && (
        <ConfirmDialog
          open
          onClose={closeConfirm}
          onConfirm={confirmChange}
          tone={pendingChange.isGrant ? "default" : "destructive"}
          loading={isPending}
          title={t(
            pendingChange.isGrant
              ? "admin:staffRoles.confirm.grantTitle"
              : "admin:staffRoles.confirm.revokeTitle",
            { role: t(pendingChange.staffRole.labelKey) },
          )}
          description={t(pendingChange.staffRole.descriptionKey)}
          confirmLabel={t(
            pendingChange.isGrant
              ? "admin:staffRoles.confirm.grantCta"
              : "admin:staffRoles.confirm.revokeCta",
          )}
          reason={{
            value: reason,
            onChange: setReason,
            required: true,
            minLength: STAFF_ROLE_REASON_MIN_LENGTH,
            maxLength: STAFF_ROLE_REASON_MAX_LENGTH,
            label: t("admin:staffRoles.confirm.reasonLabel"),
            placeholder: t("admin:staffRoles.confirm.reasonPlaceholder", {
              min: STAFF_ROLE_REASON_MIN_LENGTH,
            }),
          }}
        >
          <p>
            {t(
              pendingChange.isGrant
                ? "admin:staffRoles.confirm.grantBody"
                : "admin:staffRoles.confirm.revokeBody",
            )}
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
