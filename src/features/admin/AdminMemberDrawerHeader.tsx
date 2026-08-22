import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, AdminChip } from "./ui";
import { portrait } from "./adminPeople.data";
import { type AdminMember } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

/**
 * The member drawer's head: photo, name, and the identity/status chips.
 * Extracted from `AdminMemberDrawer` to keep that component under the repo's
 * 200-line limit.
 *
 * `member` is resolved from the live roster by `AdminMembersPage` on every
 * render, so the chips here follow a verify or a restriction as soon as the
 * list refetches.
 */
export function AdminMemberDrawerHeader({ member }: { member: AdminMember }) {
  const { t } = useTranslation();
  return (
    <div className={styles.dHead}>
      <AdminAvatar
        initials={member.initials}
        tone={member.tone}
        size="lg"
        verified={member.verified}
        // Their real photo first; the demo portrait registry only stands in
        // for fixture members, who have no `avatarUrl`.
        src={member.avatarUrl ?? portrait(member.name)}
      />
      <div>
        <h2 className={styles.dName}>{member.name}</h2>
        <div className={styles.dChips}>
          <AdminChip tone="plum">{member.pronoun}</AdminChip>
          <AdminChip tone={member.verified ? "jade" : member.statusTone} dot>
            {member.verified
              ? t("admin:members.drawer.verifiedChip")
              : t("admin:members.status.openReports", {
                  count: member.openReportsCount ?? 0,
                })}
          </AdminChip>
        </div>
      </div>
    </div>
  );
}
