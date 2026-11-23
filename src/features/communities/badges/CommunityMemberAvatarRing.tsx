import type { ReactNode } from "react";
import { CommunityFlairRing } from "./CommunityFlairRing";
import type { NameLineMember } from "./CommunityMemberFlair";
import { useCommunityMemberDecor } from "./useCommunityMemberDecor";

export interface CommunityMemberAvatarRingProps {
  communitySlug: string | undefined;
  member: NameLineMember;
  children: ReactNode;
}

/**
 * Wraps a member's round avatar in a ring in the worn badge's tint. A member
 * who wears nothing gets the plain wrapper, so the layout never shifts.
 */
export function CommunityMemberAvatarRing({
  communitySlug,
  member,
  children,
}: CommunityMemberAvatarRingProps) {
  const decor = useCommunityMemberDecor(communitySlug, member);
  return (
    <CommunityFlairRing tint={decor.flair?.tint}>{children}</CommunityFlairRing>
  );
}
