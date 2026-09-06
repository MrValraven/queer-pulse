import type { ReactNode } from "react";
import { ProfileBelowHeroSections } from "./ProfileBelowHeroSections";
import { ProfileSubprofilesSection } from "./ProfileSubprofilesSection";
import type { ProfileContentEdit } from "./ProfileSections";
import type { ProfileDraft } from "../../app/providers/useProfile";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";

export interface ProfileBelowHeroInput {
  profile: MemberProfile;
  isSelf: boolean;
  /** `isSelf && !previewing` — the owner actually looking at their own page. */
  selfView: boolean;
  previewing: boolean;
  isEditing: boolean;
  otherMember: Member | null;
  ownerSlug: string;
  draft: ProfileDraft;
  updateDraft: (patch: Partial<ProfileDraft>) => void;
}

/**
 * The two below-hero compositions a member profile needs, built once.
 *
 * `restBelowHero` is work/board/skills/groups plus communities and places,
 * without "Also working as": desktop read-mode renders the personas section
 * separately, full-width between its two rail grids. `belowHero` is the same
 * block with the personas section back on top, for the phone-width and desktop
 * edit layouts, which have no rail grid.
 *
 * Split out of `ProfilePage` to hold that component near the repo's 200-line
 * rule. It holds no state and reads no context.
 */
export function profileBelowHeroNodes({
  profile,
  isSelf,
  selfView,
  previewing,
  isEditing,
  otherMember,
  ownerSlug,
  draft,
  updateDraft,
}: ProfileBelowHeroInput): {
  restBelowHero: ReactNode;
  belowHero: ReactNode;
} {
  const edit: ProfileContentEdit | undefined =
    selfView && isEditing
      ? {
          work: draft.work,
          skills: draft.skills,
          groups: draft.groups,
          board: draft.board,
          shapings: draft.shapings,
          update: (patch) => updateDraft(patch),
        }
      : undefined;

  const restBelowHero = (
    <ProfileBelowHeroSections
      profile={profile}
      isSelf={isSelf}
      selfView={selfView}
      previewing={previewing}
      otherMember={otherMember}
      ownerSlug={ownerSlug}
      edit={edit}
    />
  );

  return {
    restBelowHero,
    belowHero: (
      <>
        <ProfileSubprofilesSection
          ownerSlug={ownerSlug}
          isSelf={selfView}
          previewing={isSelf && previewing}
        />
        {restBelowHero}
      </>
    ),
  };
}
