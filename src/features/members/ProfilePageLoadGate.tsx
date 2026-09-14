import type { ReactNode } from "react";
import { isMemberMissingError } from "./api/useMemberProfile";
import {
  ProfileLoadingState,
  ProfileErrorState,
  ProfileBlockedState,
  ProfileNotFoundState,
} from "./ProfileStateScreens";
import type { Member } from "./data/members";

export interface ProfilePageLoadGateInput {
  isSelf: boolean;
  isProfileLoading: boolean;
  isProfileError: boolean;
  onRetryProfile: () => void;
  isOtherMemberLoading: boolean;
  blocked: boolean;
  isRedirectingToMovedSlug: boolean;
  isOtherMemberError: boolean;
  otherMemberError: unknown;
  onRetryOtherMember: () => void;
  otherMember: Member | null;
}

/**
 * `ProfilePage`'s early-return guard chain: loading, error, blocked, the
 * moved-slug redirect, and not-found — resolved to whichever state screen (if
 * any) should replace the page, or `null` when none applies and the real
 * profile should render.
 *
 * The order here is the contract, not an accident. A forwarded username must
 * never flash the "no such member" wall on its way through, so the moved-slug
 * redirect check sits ABOVE both the other-member error and not-found
 * branches, which would otherwise both claim a PROFILE_MOVED 404 as an
 * absence. And a 5xx, a timeout or an offline browser is an outage, not an
 * absence — it used to fall through to the "no such member" wall, which reads
 * as "this person left" and offers no retry, so a transient failure sent
 * people away for good. Only a real 404/403 (`isMemberMissingError`) gets
 * that wall now.
 *
 * Split out of `ProfilePage` to hold that component under the repo's
 * 200-line rule; it holds no state and calls no hooks, so — unlike the hooks
 * above it in `ProfilePage` — it's safe to call from anywhere in the render.
 */
export function resolveProfilePageLoadGate({
  isSelf,
  isProfileLoading,
  isProfileError,
  onRetryProfile,
  isOtherMemberLoading,
  blocked,
  isRedirectingToMovedSlug,
  isOtherMemberError,
  otherMemberError,
  onRetryOtherMember,
  otherMember,
}: ProfilePageLoadGateInput): ReactNode | null {
  if (isSelf && isProfileLoading) return <ProfileLoadingState />;
  if (isSelf && isProfileError) {
    return <ProfileErrorState onRetry={onRetryProfile} />;
  }
  if (!isSelf && isOtherMemberLoading) return <ProfileLoadingState />;
  if (blocked) return <ProfileBlockedState />;
  if (isRedirectingToMovedSlug) return <ProfileLoadingState />;
  if (
    !isSelf &&
    isOtherMemberError &&
    !isMemberMissingError(otherMemberError)
  ) {
    return <ProfileErrorState onRetry={onRetryOtherMember} />;
  }
  if (!isSelf && !otherMember) return <ProfileNotFoundState />;
  return null;
}
