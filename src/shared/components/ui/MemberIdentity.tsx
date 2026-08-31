import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, type AvatarTint } from "./Avatar";
import { StaffBadge, type StaffRole } from "./StaffBadge";
import { staffBadgeRolesFor } from "../../staff/badgedStaffRoles";
import { initialsFromName } from "../../lib/initials";
import { tintForSlug } from "../../api/refs";
import styles from "./MemberIdentity.module.css";

export interface MemberIdentityPerson {
  slug?: string;
  name: string;
  avatarUrl?: string;
  /** Platform account tier: only "admin"/"moderator" earn a StaffBadge. */
  staffRole?: string;
  /**
   * The additive staff grants this person holds that earn a badge (ENG-28).
   * Read straight off `useStaffMap()`, same as `staffRole`. Someone handed the
   * housing queue or the magazine desk decides on other members' listings and
   * pieces, so they are badged here too, and used to show up in these rows as
   * an ordinary account.
   */
  staffBadgedRoles?: readonly string[];
}

export interface MemberIdentityProps {
  person: MemberIdentityPerson;
  /** Muted second line — pronouns, role, @handle, etc. */
  secondary?: ReactNode;
  /** When set, the avatar + name link to this profile path. */
  to?: string;
  size?: number;
  /** Show the StaffBadge when the person is staff. Default true. */
  showStaffBadge?: boolean;
  /**
   * Override the avatar tint. Defaults to a deterministic per-slug tint; pass a
   * fixed tint (e.g. "plum" for persona rows) when the caller needs a constant.
   */
  tint?: AvatarTint;
}

function asStaffRole(role: string | undefined): StaffRole | null {
  return role === "admin" || role === "moderator" ? role : null;
}

/**
 * Avatar + name (+ optional StaffBadge) + optional secondary line — the member
 * identity block duplicated across connections, the member directory, the
 * message picker, the cohost picker, and subprofile rows. Reuses the shared
 * `Avatar` and `StaffBadge` primitives. The visible name labels the avatar, so
 * the avatar image is decorative here (no `alt`).
 *
 * Deliberately NOT `.nameRow` — that class name collides across three feature
 * modules; the name line uses `.nameLine`.
 */
export function MemberIdentity({
  person,
  secondary,
  to,
  size = 40,
  showStaffBadge = true,
  tint: tintOverride,
}: MemberIdentityProps) {
  const initials = initialsFromName(person.name, "?");
  const tint =
    tintOverride ?? (person.slug ? tintForSlug(person.slug) : "default");
  // The tier wins where there is one; grants badge the people who have no tier
  // to speak for them. `staffBadgeRolesFor` owns that rule for every surface.
  const badgeRoles = showStaffBadge
    ? staffBadgeRolesFor(asStaffRole(person.staffRole), person.staffBadgedRoles)
    : [];

  const avatar = (
    <Avatar
      initials={initials}
      tint={tint}
      src={person.avatarUrl}
      size={size}
    />
  );

  return (
    <div className={styles.identity}>
      {to ? (
        // Decorative duplicate of the name link — hidden from the a11y tree and
        // out of the tab order so there's a single stop per person.
        <Link to={to} className={styles.avatarLink} aria-hidden tabIndex={-1}>
          {avatar}
        </Link>
      ) : (
        avatar
      )}
      <div className={styles.body}>
        <span className={styles.nameLine}>
          <span className={styles.name}>
            {to ? (
              <Link to={to} className={styles.nameLink}>
                {person.name}
              </Link>
            ) : (
              person.name
            )}
          </span>
          {badgeRoles.map((badgeRole) => (
            <StaffBadge key={badgeRole} role={badgeRole} />
          ))}
        </span>
        {secondary != null && secondary !== "" && (
          <span className={styles.secondary}>{secondary}</span>
        )}
      </div>
    </div>
  );
}
