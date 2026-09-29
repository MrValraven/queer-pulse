import { useVouch } from "../../app/providers/useVouch";
import type { MemberProfile } from "./data/memberProfiles";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";
import { ProfileSettingsMenu } from "./ProfileSettingsMenu";

/** The owner-only settings-menu callbacks the page hands the hero. */
export interface ProfileHeroMenuCallbacks {
  /** Open the "Who sees what" visibility sheet (only used on your own profile). */
  onOpenWhoSeesWhat?: () => void;
  /** Open the account-data sheet (only used on your own profile). */
  onOpenAccountData?: () => void;
  /** Toggle the 24h hide-me switch (only used on your own profile). */
  onToggleHidden?: () => void;
  /** Whether, and until when, the profile is currently hidden. */
  hiddenUntil?: string | null;
}

/**
 * The hero's overflow menu, picked by view: the safety menu on another
 * member's profile, the settings menu on your own, and nothing while you
 * preview your own profile as a visitor.
 */
export function ProfileHeroOverflowMenu({
  profile,
  isOwnProfile,
  isSelf,
  onOpenWhoSeesWhat,
  onOpenAccountData,
  onToggleHidden,
  hiddenUntil = null,
}: ProfileHeroMenuCallbacks & {
  profile: MemberProfile;
  /** Raw `self`: your own profile, visitor preview or not. */
  isOwnProfile: boolean;
  /** Your own profile, outside the visitor preview. */
  isSelf: boolean;
}) {
  const { hasVouched, removeVouch } = useVouch();
  // Safety controls only on another member's profile; raw `self` covers both
  // the self view and the self-as-visitor preview.
  if (!isOwnProfile) {
    return (
      <ProfileSafetyMenu
        slug={profile.slug}
        firstName={profile.first}
        onWithdrawVouch={
          hasVouched(profile.slug)
            ? (onSettled) => removeVouch(profile.slug, onSettled)
            : undefined
        }
      />
    );
  }
  // The settings counterpart shows once it is genuinely `isSelf`: the visitor
  // preview hides it, the same gate the edit CTA uses.
  if (!isSelf || !onOpenWhoSeesWhat || !onOpenAccountData || !onToggleHidden) {
    return null;
  }
  return (
    <ProfileSettingsMenu
      profile={profile}
      onOpenWhoSeesWhat={onOpenWhoSeesWhat}
      onOpenAccountData={onOpenAccountData}
      onToggleHidden={onToggleHidden}
      hiddenUntil={hiddenUntil}
    />
  );
}
