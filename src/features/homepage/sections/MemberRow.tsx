import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Avatar } from "../../../shared/components/ui";
import { MemberStaffBadge } from "../../../shared/staff/MemberStaffBadge";
import type { Member } from "../data/types";
import { profilePath } from "./Discovery.data";
import styles from "./Discovery.module.css";

/** A compact member row for the stack beside the featured card. */
export function MemberRow({ member }: { member: Member }) {
  return (
    <Link to={profilePath(member)} className={styles.rowE}>
      <Avatar
        src={member.photo}
        initials={member.initials}
        tint={member.tint}
        size={48}
        verified={member.verified}
        alt={member.name}
      />
      <span className={styles.rowMeta}>
        <span className={styles.nameRow}>
          <span className={styles.rowName}>{member.name}</span>
          <MemberStaffBadge slug={member.key} />
        </span>
        <span className={styles.rowSub}>
          {member.role} · {member.hood}
        </span>
      </span>
      <span className={styles.arrow} aria-hidden>
        <FiArrowRight />
      </span>
    </Link>
  );
}
