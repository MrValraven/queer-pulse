import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToggle } from "./ui";
import type { StaffRoleMeta } from "./staffRoles.registry";
import styles from "./AdminMembersPage.module.css";

/**
 * One row of the drawer's staff-role grant list: the role's name and what it
 * opens, plus the toggle that asks for the change.
 *
 * The toggle files nothing itself (PRD-288). It hands the request up, and the
 * parent opens the `ConfirmDialog` that takes the admin's reason.
 */
export function AdminStaffRoleRow({
  staffRole,
  checked,
  disabled,
  onRequestChange,
}: {
  staffRole: StaffRoleMeta;
  /** True when the member holds this grant, or holds it implicitly as admin. */
  checked: boolean;
  disabled: boolean;
  /** `true` asks to grant the role, `false` to revoke it. */
  onRequestChange: (isGrant: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <li className={styles.staffRoleRow}>
      <div className={styles.staffRoleText}>
        <span className={styles.staffRoleLabel}>{t(staffRole.labelKey)}</span>
        <span className={styles.staffRoleDesc}>
          {t(staffRole.descriptionKey)}
        </span>
      </div>
      <AdminToggle
        checked={checked}
        disabled={disabled}
        label={t(staffRole.labelKey)}
        onChange={onRequestChange}
      />
    </li>
  );
}
