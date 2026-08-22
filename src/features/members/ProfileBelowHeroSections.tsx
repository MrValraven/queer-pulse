import { ProfileContent, type ProfileContentEdit } from "./ProfileSections";
import { ProfileCommunitiesSection } from "./ProfileCommunitiesSection";
import { PlacesSection } from "./PlacesSection";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";

/**
 * Everything on a member profile below the hero, except "Also working as":
 * work/board/skills/groups, communities, and places. Desktop read-mode renders
 * the personas section separately, full-width between its two rail grids, so it
 * stays out of this block and `ProfilePage` composes the two.
 *
 * Split out of `ProfilePage` to keep that component inside the repo's 200-line
 * rule; it holds no state of its own.
 */
export function ProfileBelowHeroSections({
  profile,
  isSelf,
  selfView,
  previewing,
  otherMember,
  ownerSlug,
  edit,
}: {
  profile: MemberProfile;
  isSelf: boolean;
  /** `isSelf && !previewing` — the owner actually looking at their own page. */
  selfView: boolean;
  previewing: boolean;
  otherMember: Member | null;
  ownerSlug: string;
  /** The live edit draft + patcher, only while the owner is editing. */
  edit?: ProfileContentEdit;
}) {
  return (
    <>
      <ProfileContent profile={profile} isSelf={selfView} edit={edit} />
      <ProfileCommunitiesSection
        isSelf={isSelf}
        previewing={previewing}
        otherMember={otherMember}
        firstName={profile.first}
      />
      <PlacesSection
        memberSlug={ownerSlug}
        isSelf={selfView}
        firstName={profile.first}
      />
    </>
  );
}
