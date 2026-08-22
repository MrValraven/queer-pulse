import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminAvatar, AdminChip } from "./ui";
import { portrait } from "./adminPeople.data";
import { STAFF_ROLES } from "./staffRoles.registry";
import type {
  AdminMember,
  FlaggedMember,
  VouchAvatar,
} from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

/**
 * A vouch avatar as the live adapter emits it: `VouchAvatarRow` carries the
 * vouching member's `slug`, which the shared view model has no field for. Demo
 * fixtures predate it, so it stays optional here and the key falls back to the
 * avatar's own initials.
 */
type VouchAvatarWithSlug = VouchAvatar & { slug?: string };

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
          <div
            className={styles.row}
            role="button"
            tabIndex={0}
            aria-label={t("admin:members.openAriaLabel", { name: member.name })}
            onClick={() => onSelect(member)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(member);
              }
            }}
          >
            <AdminAvatar
              initials={member.initials}
              tone={member.tone}
              size="md"
              verified={member.verified}
              src={member.avatarUrl ?? portrait(member.name)}
            />
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{member.name}</span>
                <span className={styles.pronoun}>{member.pronoun}</span>
                <AdminChip tone={member.statusTone} dot>
                  {member.verified
                    ? t("admin:members.status.verified")
                    : t("admin:members.status.openReports", {
                        count: member.openReportsCount ?? 0,
                      })}
                </AdminChip>
                {member.role !== "member" && (
                  <AdminChip tone={member.role === "admin" ? "violet" : "plum"}>
                    {t(`admin:members.role.value.${member.role}`)}
                  </AdminChip>
                )}
                {STAFF_ROLES.filter((staffRole) =>
                  member.staffRoles.includes(staffRole.id),
                ).map((staffRole) => (
                  <AdminChip key={staffRole.id} tone="ghost">
                    {t(staffRole.labelKey)}
                  </AdminChip>
                ))}
              </div>
              <div className={styles.rowMeta}>{member.meta}</div>
            </div>
            <VouchStrip
              vouchedBy={member.vouchedBy}
              total={member.vouchCount}
            />
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

function VouchStrip({
  vouchedBy,
  total,
}: {
  vouchedBy: VouchAvatarWithSlug[];
  total: number;
}) {
  const { t } = useTranslation();
  const shown = vouchedBy.slice(0, 4);
  const more = total - shown.length;
  return (
    <div className={styles.vouchStrip}>
      <div className={styles.stack}>
        {shown.map((vouchAvatar, position) => (
          <span
            key={vouchAvatar.slug ?? `${vouchAvatar.initials}-${position}`}
            className={styles.stackItem}
            style={{ zIndex: shown.length - position }}
          >
            <AdminAvatar
              initials={vouchAvatar.initials}
              tone={vouchAvatar.tone}
              size="sm"
              src={vouchAvatar.avatarUrl ?? undefined}
            />
          </span>
        ))}
        {more > 0 && <span className={styles.stackMore}>+{more}</span>}
      </div>
      <span className={styles.vouchLabel}>
        {t("admin:members.vouchedLabel")}
      </span>
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
