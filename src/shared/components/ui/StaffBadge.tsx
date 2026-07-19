import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./StaffBadge.module.css";

/** A platform-level role that earns a badge. A subset of `MemberRole` —
 *  plain members get nothing, so they are not representable here. */
export type StaffRole = "admin" | "moderator";

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
 * Not to be confused with the forum's `OfficialBadge`, which marks the
 * institutional QueerPulse *account* rather than a person who works here.
 */
export function StaffBadge({
  role,
  size = "sm",
  className,
}: {
  role: StaffRole;
  size?: StaffBadgeSize;
  className?: string;
}) {
  const { t } = useTranslation();
  const longLabel = t(LONG_LABEL_KEY[role]);
  const label = size === "lg" ? longLabel : t(SHORT_LABEL_KEY[role]);
  return (
    <span
      className={[styles.badge, styles[role], styles[size], className]
        .filter(Boolean)
        .join(" ")}
      title={longLabel}
    >
      <FiShield aria-hidden />
      {label}
    </span>
  );
}
