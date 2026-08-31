import { StaffBadge, type StaffBadgeSize } from "../components/ui/StaffBadge";
import { staffBadgeRolesFor } from "./badgedStaffRoles";
import { useStaffIdentity } from "./useStaffRole";

/**
 * The staff badge for a member slug — resolves the role itself and renders
 * nothing for the overwhelming majority of members who are not staff.
 *
 * This is what surfaces use. `StaffBadge` stays presentational so the visual
 * can be tested and previewed without mocking auth or the roster; this holds
 * the data access. Rendering null (rather than an empty pill) matters: a
 * directory page mounts dozens of these at once.
 *
 * Usually one badge. A member who is on the roster for their grants alone gets
 * one per grant, which is why this can return a fragment; `staffBadgeRolesFor`
 * holds that rule. Every layout that mounts this puts it on a wrapping flex
 * line beside the name, so a second pill wraps rather than pushing the name.
 */
export function MemberStaffBadge({
  slug,
  size = "sm",
  className,
}: {
  slug: string | undefined;
  size?: StaffBadgeSize;
  className?: string;
}) {
  const { tier, badgedStaffRoles } = useStaffIdentity(slug);
  const badgeRoles = staffBadgeRolesFor(tier, badgedStaffRoles);
  if (badgeRoles.length === 0) return null;
  return (
    <>
      {badgeRoles.map((badgeRole) => (
        <StaffBadge
          key={badgeRole}
          role={badgeRole}
          size={size}
          className={className}
        />
      ))}
    </>
  );
}
