import { StaffBadge, type StaffBadgeSize } from "../components/ui/StaffBadge";
import { useStaffRole } from "./useStaffRole";

/**
 * The staff badge for a member slug — resolves the role itself and renders
 * nothing for the overwhelming majority of members who are not staff.
 *
 * This is what surfaces use. `StaffBadge` stays presentational so the visual
 * can be tested and previewed without mocking auth or the roster; this holds
 * the data access. Rendering null (rather than an empty pill) matters: a
 * directory page mounts dozens of these at once.
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
  const staffRole = useStaffRole(slug);
  if (!staffRole) return null;
  return <StaffBadge role={staffRole} size={size} className={className} />;
}
