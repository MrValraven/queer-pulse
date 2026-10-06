import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStaffRosterRowDTO } from "./api/adminStaffRoster.api";
import {
  groupStaffRows,
  type StaffRosterGroup,
} from "./adminStaffRoster.utils";
import { AdminStaffRow } from "./AdminStaffRow";
import styles from "./AdminStaffRows.module.css";

const GROUP_HEADING_KEY: Record<StaffRosterGroup["tier"], string> = {
  admin: "admin:staff.group.admin",
  moderator: "admin:staff.group.moderator",
  member: "admin:staff.group.member",
};

/** The filtered roster, one labelled section per tier that has anyone in it. */
export function AdminStaffRows({
  rows,
  onManage,
}: {
  rows: AdminStaffRosterRowDTO[];
  onManage: (memberId: string) => void;
}) {
  const groups = groupStaffRows(rows);
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <StaffGroup key={group.tier} group={group} onManage={onManage} />
      ))}
    </div>
  );
}

function StaffGroup({
  group,
  onManage,
}: {
  group: StaffRosterGroup;
  onManage: (memberId: string) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.groupTitle}>
        {t(GROUP_HEADING_KEY[group.tier])}
        <span className={styles.groupCount}>{group.rows.length}</span>
      </h3>
      <ul className={styles.rows}>
        {group.rows.map((staffMember) => (
          <li key={staffMember.id} className={styles.rowItem}>
            <AdminStaffRow staffMember={staffMember} onManage={onManage} />
          </li>
        ))}
      </ul>
    </section>
  );
}
