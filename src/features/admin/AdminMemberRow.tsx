import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, AdminChip } from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import { STAFF_ROLES } from "./staffRoles.registry";
import type { AdminMember, VouchAvatar } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

/**
 * A vouch avatar as the live adapter emits it: `VouchAvatarRow` carries the
 * vouching member's `slug`, which the shared view model has no field for. Demo
 * fixtures predate it, so it stays optional here and the key falls back to the
 * avatar's own initials.
 */
type VouchAvatarWithSlug = VouchAvatar & { slug?: string };

/**
 * One roster row, split out of `AdminMemberRows` to keep that file under the
 * per-component line limit.
 *
 * DES-425: a native `<button>`, so Enter, Space and the focus ring come from
 * the platform. Its label carries everything the row shows at a glance (name,
 * verified status, role and open-report count): a label of the name alone
 * used to hide all three from a screen reader.
 */
export function AdminMemberRow({
  member,
  onSelect,
}: {
  member: AdminMember;
  onSelect: (member: AdminMember) => void;
}) {
  const { t } = useTranslation();
  const demoPortrait = useDemoPortrait();
  const openReportsCount = member.openReportsCount ?? 0;
  const accessibleName = t("admin:members.row.ariaLabel", {
    name: member.name,
    status: member.verified
      ? t("admin:members.status.verified")
      : t("admin:members.row.notVerified"),
    role: t(`admin:members.role.value.${member.role}`),
    reports: t("admin:members.status.openReports", {
      count: openReportsCount,
    }),
  });

  return (
    <button
      type="button"
      className={`${styles.row} ${styles.rowButton}`}
      aria-label={accessibleName}
      onClick={() => onSelect(member)}
    >
      <AdminAvatar
        initials={member.initials}
        tone={member.tone}
        size="md"
        verified={member.verified}
        // Their own photo in live mode; the name-keyed registry only
        // stands in for demo fixtures, which have no `avatarUrl`.
        src={member.avatarUrl ?? demoPortrait(member.name)}
      />
      <span className={styles.rowMain}>
        <span className={styles.rowTop}>
          <span className={styles.rowName}>{member.name}</span>
          <span className={styles.pronoun}>{member.pronoun}</span>
          <AdminChip tone={member.statusTone} dot>
            {member.verified
              ? t("admin:members.status.verified")
              : t("admin:members.status.openReports", {
                  count: openReportsCount,
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
        </span>
        <span className={styles.rowMeta}>{member.meta}</span>
      </span>
      <VouchStrip vouchedBy={member.vouchedBy} total={member.vouchCount} />
    </button>
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
    <span className={styles.vouchStrip}>
      <span className={styles.stack}>
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
      </span>
      <span className={styles.vouchLabel}>
        {t("admin:members.vouchedLabel")}
      </span>
    </span>
  );
}
