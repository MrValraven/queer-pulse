import { useAuth } from "../../app/providers/authContext";

/**
 * The signed-in member's name for invite copy (the share message and the unfurl
 * preview). Sourced from the authenticated user, so it's the real member in live
 * mode and the mock persona in demo mode — never a hardcoded name. Empty strings
 * when logged out (live), which the callers render as an unnamed invite.
 */
export function useInviteSender(): { first: string; full: string } {
  const { user } = useAuth();
  const first = user?.profile.firstName ?? "";
  const last = user?.profile.lastName ?? "";
  return { first, full: `${first} ${last}`.trim() };
}
