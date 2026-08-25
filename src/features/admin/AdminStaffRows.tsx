import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, AdminChip } from "./ui";
import { portrait } from "./adminPeople.data";
import type { PlatformStaffRowDTO } from "./api/adminStaffRoster.api";
import styles from "./AdminStaffPage.module.css";

const ROLE_LONG_LABEL_KEY: Record<PlatformStaffRowDTO["platformRole"], string> =
  {
    admin: "shared:staffBadge.admin.long",
    moderator: "shared:staffBadge.moderator.long",
  };

function initialsFor(firstName: string, lastName: string): string {
  const first = firstName.charAt(0);
  const last = lastName.charAt(0);
  return (first + last).toUpperCase() || "?";
}

/** One row per staff member: avatar, name, handle, and their platform role. */
export function AdminStaffRows({ staff }: { staff: PlatformStaffRowDTO[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {staff.map((member) => {
        const name = `${member.firstName} ${member.lastName}`.trim();
        return (
          <div className={styles.row} key={member.slug}>
            <AdminAvatar
              initials={initialsFor(member.firstName, member.lastName)}
              tone={member.platformRole === "admin" ? "violet" : "plum"}
              size="md"
              src={portrait(name)}
            />
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{name}</span>
                <span className={styles.rowHandle}>@{member.slug}</span>
              </div>
            </div>
            <AdminChip
              tone={member.platformRole === "admin" ? "violet" : "plum"}
            >
              {t(ROLE_LONG_LABEL_KEY[member.platformRole])}
            </AdminChip>
          </div>
        );
      })}
    </div>
  );
}
