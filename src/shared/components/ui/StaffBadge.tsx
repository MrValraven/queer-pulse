import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import {
  BADGED_STAFF_ROLE_LABEL_KEY,
  isBadgedStaffRoleId,
  type BadgedStaffRoleId,
} from "../../staff/badgedStaffRoles";
import styles from "./StaffBadge.module.css";

/** A platform-level account tier that earns a badge. A subset of `MemberRole` —
 *  plain members get nothing, so they are not representable here. */
export type StaffRole = "admin" | "moderator";

/**
 * Everything this badge can name: the two account tiers, and the additive staff
 * grants that earn a badge of their own (ENG-28). One component covers both on
 * purpose. A member who can decline your housing listing and a moderator are
 * the same fact to the person reading the badge, which is that the platform is
 * acting, and a second visual treatment would read as a second, lesser kind of
 * staff.
 */
export type StaffBadgeRole = StaffRole | BadgedStaffRoleId;

/** `lg` is the member's own profile hero; `sm` is everywhere else. */
export type StaffBadgeSize = "sm" | "lg";

const LONG_LABEL_KEY: Record<StaffRole, string> = {
  admin: "shared:staffBadge.admin.long",
  moderator: "shared:staffBadge.moderator.long",
};

const SHORT_LABEL_KEY: Record<StaffRole, string> = {
  admin: "shared:staffBadge.admin.short",
  moderator: "shared:staffBadge.moderator.short",
};

/**
 * Marks a human who works for QueerPulse.
 *
 * Deliberately inert — never a link. Most bylines already wrap the member's
 * name in a `<Link>`, and an anchor nested inside an anchor is invalid HTML
 * that browsers silently restructure. The name stays the link; this sits
 * beside it.
 *
 * Both sizes carry a VISIBLE label. The `title` only ever adds the long form,
 * never information found nowhere else — `title` does not fire on touch, so an
 * icon-only badge would tell phone users nothing.
 *
 * It names an account tier (moderator, admin) or a single badged staff grant
 * (`shared/staff/badgedStaffRoles`). A person holding several grants gets one
 * of these per grant, rendered by `MemberStaffBadge`.
 *
 * Not to be confused with the forum's `OfficialBadge`, which marks the
 * institutional QueerPulse *account* rather than a person who works here.
 */
export function StaffBadge({
  role,
  size = "sm",
  className,
}: {
  role: StaffBadgeRole;
  size?: StaffBadgeSize;
  className?: string;
}) {
  const { t } = useTranslation();
  // A grant carries ONE label at both sizes. The tier labels have a long and a
  // short form because "QueerPulse Staff" has an obvious abbreviation; a grant
  // label is already the plainest short way to say what the person does, and
  // shortening "Housing Moderator" any further would say less than it costs.
  const isGrant = isBadgedStaffRoleId(role);
  const longLabel = isGrant
    ? t(BADGED_STAFF_ROLE_LABEL_KEY[role])
    : t(LONG_LABEL_KEY[role]);
  const label = isGrant || size === "lg" ? longLabel : t(SHORT_LABEL_KEY[role]);
  // Grants share one tone: they are peers of each other, and six tones next to
  // a name would read as a taxonomy the reader is expected to learn.
  const toneClass = isGrant ? styles.grant : styles[role];
  return (
    <span
      className={[styles.badge, toneClass, styles[size], className]
        .filter(Boolean)
        .join(" ")}
      title={longLabel}
    >
      <FiShield aria-hidden />
      {label}
    </span>
  );
}
