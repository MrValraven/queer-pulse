import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToggle } from "./ui";
import { useGrantStaffRole, useRevokeStaffRole } from "./api/useAdminMembers";
import { STAFF_ROLES, type StaffRoleId } from "./staffRoles.registry";
import type { MemberRole } from "./api/adminMembers.api";
import styles from "./AdminMembersPage.module.css";

/**
 * The drawer's staff-role section: additive functional grants (e.g. the
 * magazine desk) layered on top of a member's account tier — see
 * `staffRoles.registry.ts`. One `AdminToggle` per registry entry; the
 * backend owns the real guardrails and answers 403/409 with a reason
 * (surfaced by the global mutation-error toast), so — mirroring
 * `AdminMemberRoleControl` — this only renders the two states it can know
 * locally as a disabled, explained state: a system account (no staff roles
 * at all) and an admin (who already holds every capability implicitly).
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
  const grantStaffRole = useGrantStaffRole();
  const revokeStaffRole = useRevokeStaffRole();

  const isAdmin = role === "admin";
  const lockedReason = isSystem
    ? t("admin:staffRoles.systemLocked")
    : isAdmin
      ? t("admin:staffRoles.adminSuperset")
      : null;
  const isPending = grantStaffRole.isPending || revokeStaffRole.isPending;
  const togglesDisabled = isSystem || isAdmin || isPending;

  const onToggle = (staffRoleId: StaffRoleId, nextChecked: boolean) => {
    const mutation = nextChecked ? grantStaffRole : revokeStaffRole;
    mutation.mutate({ memberId, slug, role: staffRoleId, isSystem });
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
                onChange={(nextChecked) => onToggle(staffRole.id, nextChecked)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
