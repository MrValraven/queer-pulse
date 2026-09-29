import { staffBadgeRolesFor } from "../staff/badgedStaffRoles";
import {
  useIsStaffRosterSettled,
  useStaffIdentity,
} from "../staff/useStaffRole";
import { AmbassadorTag, type AmbassadorTagSize } from "./AmbassadorTag";
import { useAmbassadorIdentity } from "./useAmbassadorMap";

/**
 * The Ambassador tag for a member slug. Resolves the roster itself and renders
 * nothing for everyone who is not a visible ambassador, which is almost
 * everyone, so a directory page can mount dozens of these cheaply.
 *
 * Mounted only from the two staff-badge choke points (`MemberStaffBadge` and
 * `MemberIdentity`), and only when they have no staff badge to show.
 *
 * It still checks the staff roster itself, because most `MemberIdentity`
 * callers pass no staff props: their rows show no staff badge whoever the
 * member is, and without this check a staff member who is also an ambassador
 * would wear the tag there while their profile shows the staff badge. The rule
 * is the one `MemberStaffBadge` applies: if the roster would badge them, the
 * tag stays off. The roster is a query the page already holds, so the check
 * costs no request.
 *
 * It also waits until the staff roster has answered. Before then "no staff
 * badge" only means "not loaded yet", and the tag would show for a moment
 * before the staff badge replaced it.
 */
export function MemberAmbassadorTag({
  slug,
  size = "sm",
  className,
}: {
  slug: string | undefined;
  size?: AmbassadorTagSize;
  className?: string;
}) {
  const identity = useAmbassadorIdentity(slug);
  const isStaffRosterSettled = useIsStaffRosterSettled();
  const { tier, badgedStaffRoles } = useStaffIdentity(slug);
  const isBadgedStaff = staffBadgeRolesFor(tier, badgedStaffRoles).length > 0;
  if (!identity || !isStaffRosterSettled || isBadgedStaff) return null;
  return (
    <AmbassadorTag identity={identity} size={size} className={className} />
  );
}
