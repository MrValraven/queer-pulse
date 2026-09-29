import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminAvatar, AdminChip } from "./ui";
import { AdminMemberRow } from "./AdminMemberRow";
import type { AdminMember, FlaggedMember } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

/* ── All members ─────────────────────────────────────────── */

export function AdminMemberRows({
  members,
  onSelect,
}: {
  members: AdminMember[];
  onSelect: (member: AdminMember) => void;
}) {
  const { t } = useTranslation();
  if (members.length === 0) {
    return <p className={styles.emptyLine}>{t("admin:members.empty")}</p>;
  }
  return (
    <div className={styles.rows}>
      {members.map((member, position) => (
        <FadeIn key={member.id} delay={Math.min(position, 8) * 50}>
          <AdminMemberRow member={member} onSelect={onSelect} />
        </FadeIn>
      ))}
    </div>
  );
}

/* ── Flagged ─────────────────────────────────────────────── */

export function AdminFlaggedRows({
  members,
  onOpenMember,
}: {
  members: FlaggedMember[];
  /**
   * Opens the member drawer on one flagged member. Receives their `id`,
   * which is what `GET /admin/members/:id` takes. The demo fixtures use the
   * handle without its leading "@" as both `id` and `slug`, so either
   * resolves there.
   */
  onOpenMember: (memberId: string) => void;
}) {
  return (
    <div className={styles.rows}>
      {members.map((member, position) => (
        <FadeIn key={member.id} delay={Math.min(position, 8) * 50}>
          <AdminFlaggedRow member={member} onOpenMember={onOpenMember} />
        </FadeIn>
      ))}
    </div>
  );
}

/**
 * One flagged row carries two destinations, so it is a plain container
 * holding two SIBLING controls rather than one control nested in the other:
 * the identity half is a button that opens the member drawer, and "Open
 * reports" is a link into the moderation queue narrowed to this member's
 * reports. The queue matches a report's `subjectId` against the member's
 * stable slug, which in the demo fixtures is the handle without its "@",
 * exactly what the demo queue matches on.
 */
function AdminFlaggedRow({
  member,
  onOpenMember,
}: {
  member: FlaggedMember;
  onOpenMember: (memberId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.row} ${styles.rowFlagged}`}>
      <button
        type="button"
        className={styles.flaggedIdentity}
        onClick={() => onOpenMember(member.id)}
        aria-label={t("admin:members.flagged.openMemberAriaLabel", {
          handle: member.handle,
        })}
      >
        <AdminAvatar
          initials={member.initials}
          tone={member.tone}
          size="md"
          src={member.avatarUrl ?? undefined}
        />
        <div className={styles.rowMain}>
          <div className={styles.rowTop}>
            <span className={styles.rowHandle}>{member.handle}</span>
            <AdminChip tone={member.categoryTone}>
              {member.category.kind === "reportsCount"
                ? t("admin:members.flagged.reportsCount", {
                    count: member.category.count,
                  })
                : t(`admin:members.flagged.category.${member.category.kind}`)}
            </AdminChip>
          </div>
          <div className={styles.rowMeta}>{member.meta}</div>
        </div>
      </button>
      <AdminChip tone={member.statusTone} dot>
        {t(`admin:members.flagged.status.${member.statusId}`)}
      </AdminChip>
      <Link
        className={styles.flaggedGoto}
        to={`${routes.adminModeration}?tab=open&subjectId=${encodeURIComponent(member.slug)}`}
        aria-label={t("admin:members.flagged.openReportsAriaLabel", {
          handle: member.handle,
        })}
      >
        {t("admin:members.flagged.openReportsCta")}
        <FiChevronRight aria-hidden />
      </Link>
    </div>
  );
}
