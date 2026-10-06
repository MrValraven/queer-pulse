import { FiExternalLink, FiSettings } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminAvatar, AdminChip } from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import type { AdminStaffRosterRowDTO } from "./api/adminStaffRoster.api";
import {
  parseIsoDate,
  staffFullName,
  staffInitials,
  staffRoleMeta,
  type StaffTier,
} from "./adminStaffRoster.utils";
import styles from "./AdminStaffRow.module.css";

/** One avatar tint per tier; the group heading above names the tier. */
const TIER_TONE: Record<StaffTier, "violet" | "plum" | "jade"> = {
  admin: "violet",
  moderator: "plum",
  member: "jade",
};

/** What a row says in its grants column when the person holds none. */
const NO_GRANTS_KEY: Record<StaffTier, string> = {
  admin: "admin:staff.row.allAccess",
  moderator: "admin:staff.row.tierOnly",
  member: "admin:staff.row.tierOnly",
};

const GRANT_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
const JOINED_DATE: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};

/**
 * One person on the roster: who they are, what they hold, and the two ways
 * onward (Manage opens the member drawer on this page, the icon
 * opens their public profile). Only those two controls are interactive.
 */
export function AdminStaffRow({
  staffMember,
  onManage,
}: {
  staffMember: AdminStaffRosterRowDTO;
  onManage: (memberId: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const demoPortrait = useDemoPortrait();
  const name = staffFullName(staffMember);
  const tier = staffMember.platformRole;
  const tone = TIER_TONE[tier];
  const joinedAt = parseIsoDate(staffMember.joinedAt);

  return (
    <article className={styles.row} aria-label={name}>
      <div className={styles.identity}>
        <AdminAvatar
          initials={staffInitials(staffMember)}
          tone={tone}
          size="md"
          alt=""
          // Their own photo when they share one (the roster already honours
          // the member's photo setting); the name-keyed fixtures stand in for
          // demo only and return nothing live, which falls through to initials.
          src={staffMember.avatarUrl ?? demoPortrait(name)}
        />
        <div className={styles.identityText}>
          <div className={styles.nameLine}>
            <span className={styles.name}>{name}</span>
            {staffMember.status !== "active" && (
              <AdminChip
                tone={staffMember.status === "suspended" ? "warn" : "ghost"}
                dot
              >
                {t(`admin:staff.row.status.${staffMember.status}`)}
              </AdminChip>
            )}
          </div>
          <div className={styles.metaLine}>
            <span className={styles.handle}>@{staffMember.slug}</span>
            {joinedAt && (
              <span className={styles.joined}>
                {t("admin:staff.row.joined", {
                  date: fmt.date(joinedAt, JOINED_DATE),
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.grants}>
        {staffMember.grants.length > 0 ? (
          <ul
            className={styles.grantList}
            aria-label={t("admin:staff.grantsLabel")}
          >
            {staffMember.grants.map((grant) => {
              const meta = staffRoleMeta(grant.role);
              const grantedAt = parseIsoDate(grant.grantedAt);
              const grantedDate = grantedAt
                ? fmt.date(grantedAt, GRANT_DATE)
                : null;
              return (
                <li key={grant.role}>
                  <AdminChip
                    tone="jade"
                    title={
                      grantedDate
                        ? t("admin:staff.row.grantedOn", { date: grantedDate })
                        : undefined
                    }
                  >
                    {meta ? t(meta.labelKey) : grant.role}
                    {/* The title tooltip only reaches a mouse; this carries
                        the date to keyboard, touch and screen reader users. */}
                    {grantedDate && (
                      <span className="visuallyHidden">
                        {t("admin:staff.row.grantedOnSpoken", {
                          date: grantedDate,
                        })}
                      </span>
                    )}
                  </AdminChip>
                </li>
              );
            })}
          </ul>
        ) : (
          <span className={styles.noGrants}>{t(NO_GRANTS_KEY[tier])}</span>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.actionButton}
          onClick={() => onManage(staffMember.id)}
          aria-label={t("admin:staff.row.manageAria", { name })}
        >
          <FiSettings aria-hidden />
          {t("admin:staff.row.manage")}
        </Button>
        <Button
          variant="icon"
          size="sm"
          className={styles.actionButton}
          to={`${routes.members}/${staffMember.slug}`}
          aria-label={t("admin:staff.row.viewProfile", { name })}
          title={t("admin:staff.row.viewProfile", { name })}
        >
          <FiExternalLink aria-hidden />
        </Button>
      </div>
    </article>
  );
}
