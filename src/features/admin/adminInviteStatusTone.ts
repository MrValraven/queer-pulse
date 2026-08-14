import type { AdminTone } from "./ui";
import type { AdminInviteStatus } from "./api/adminInvites.api";

/**
 * Chip tone per invite status, matching the sent-invites palette (amber =
 * pending). Shared by the list row and the detail drawer so both render the
 * same status chip. Kept in its own module (like the verification status-tone
 * maps) so the drawer and page don't import each other.
 */
export const ADMIN_INVITE_STATUS_TONE: Record<AdminInviteStatus, AdminTone> = {
  valid: "amber",
  used: "jade",
  expired: "ghost",
  revoked: "coral",
};
