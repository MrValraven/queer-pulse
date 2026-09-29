import { MemberAmbassadorTag } from "../ambassadors/MemberAmbassadorTag";
import { StaffBadge, type StaffBadgeSize } from "../components/ui/StaffBadge";
import { staffBadgeRolesFor } from "./badgedStaffRoles";
import { useStaffIdentity } from "./useStaffRole";

/**
 * The staff badge for a member slug. It resolves the role itself and renders
 * nothing for the overwhelming majority of members who are not staff.
 *
 * For a member with no staff badge it also renders the Ambassador tag, when
 * they are a visible ambassador. Staff win: someone who wears a staff badge
 * shows only that, so the tag never sits beside one. A staff grant with no
 * public badge (`partnerships`) earns nothing here, so its holder can still
 * show the tag. Mounting the tag here is what puts it on every surface that
 * already shows staff, with no call site edited.
 *
 * The `icon` size is the exception: it is the shield beside a profile hero's
 * name, and the hero mounts `MemberAmbassadorTag` on its role line itself, so
 * at `icon` a member with no staff badge renders nothing here.
 *
 * This is what surfaces use. `StaffBadge` stays presentational so the visual
 * can be tested and previewed without mocking auth or the roster; this holds
 * the data access. Rendering null (rather than an empty pill) matters: a
 * directory page mounts dozens of these at once.
 *
 * Usually one badge. A member who is on the roster for their grants alone gets
 * one per grant, which is why this can return a fragment; `staffBadgeRolesFor`
 * holds that rule. Every layout that mounts this MUST put it on a wrapping
 * flex line beside the name, so a second pill wraps rather than pushing the
 * name.
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
  if (badgeRoles.length === 0) {
    if (size === "icon") return null;
    return (
      <MemberAmbassadorTag slug={slug} size={size} className={className} />
    );
  }
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
