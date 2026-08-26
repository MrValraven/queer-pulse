import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, AdminChip } from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import { STAFF_ROLES, type StaffRoleId } from "./staffRoles.registry";
import styles from "./AdminStaffPage.module.css";

/** One person on the staff page: their account tier plus any additive grants. */
export interface StaffRosterRow {
  slug: string;
  firstName: string;
  lastName: string;
  platformRole: "member" | "moderator" | "admin";
  /** Additive grants held on top of the tier (OPS-03). Empty for most people. */
  staffRoles: StaffRoleId[];
}

const ROLE_LONG_LABEL_KEY: Record<StaffRosterRow["platformRole"], string> = {
  admin: "shared:staffBadge.admin.long",
  moderator: "shared:staffBadge.moderator.long",
  // A grant holder on the ordinary member tier: they are on this page for what
  // they were handed, not for a tier they do not have.
  member: "admin:staff.tier.member",
};

const STAFF_ROLE_LABEL_KEY: Record<string, string> = Object.fromEntries(
  STAFF_ROLES.map((staffRole) => [staffRole.id, staffRole.labelKey]),
);

function initialsFor(firstName: string, lastName: string): string {
  const first = firstName.charAt(0);
  const last = lastName.charAt(0);
  return (first + last).toUpperCase() || "?";
}

/** One row per staff member: avatar, name, handle, tier, and their grants. */
export function AdminStaffRows({ staff }: { staff: StaffRosterRow[] }) {
  const { t } = useTranslation();
  const demoPortrait = useDemoPortrait();
  return (
    <div className={styles.rows}>
      {staff.map((member) => {
        const name = `${member.firstName} ${member.lastName}`.trim();
        const tone =
          member.platformRole === "admin"
            ? "violet"
            : member.platformRole === "moderator"
              ? "plum"
              : "jade";
        return (
          <div className={styles.row} key={member.slug}>
            <AdminAvatar
              initials={initialsFor(member.firstName, member.lastName)}
              tone={tone}
              size="md"
              // Neither `PlatformStaffRowDTO` nor `AdminStaffRoleHolderDTO`
              // carries a photo, and the registry behind `portrait()` is keyed
              // by NAME: read live it would hand a real moderator the stock
              // face of whichever fixture person shares their name. Demo keeps
              // its faces; live falls through to tinted initials.
              src={demoPortrait(name)}
            />
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{name}</span>
                <span className={styles.rowHandle}>@{member.slug}</span>
              </div>
              {member.staffRoles.length > 0 && (
                <div className={styles.rowGrants}>
                  <span className={styles.rowGrantsLabel}>
                    {t("admin:staff.grantsLabel")}
                  </span>
                  {member.staffRoles.map((staffRole) => (
                    <AdminChip key={staffRole} tone="jade">
                      {STAFF_ROLE_LABEL_KEY[staffRole]
                        ? t(STAFF_ROLE_LABEL_KEY[staffRole])
                        : staffRole}
                    </AdminChip>
                  ))}
                </div>
              )}
            </div>
            <AdminChip tone={tone}>
              {t(ROLE_LONG_LABEL_KEY[member.platformRole])}
            </AdminChip>
          </div>
        );
      })}
    </div>
  );
}
