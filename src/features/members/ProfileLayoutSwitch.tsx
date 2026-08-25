import type { ReactNode } from "react";
import { ProfileHero } from "./ProfileSections";
import { ProfileRail, ProfileSectionNavRail } from "./ProfileRail";
import { ProfileSubprofilesSection } from "./ProfileSubprofilesSection";
import { EditableProfileHero } from "./EditableProfileHero";
import { MobileProfileView } from "./MobileProfileView";
import { MobileEditableProfileHero } from "./MobileEditableProfileHero";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";
import styles from "./ProfilePage.module.css";

/**
 * Desktop read-mode layout: the sticky rail runs in two pieces here, not
 * one. The portrait/trust-signals/owner-controls block stays paired with
 * the hero (first `.pageGrid`), while "Also working as" — the owner's
 * linked + published personas, surfaced right after the hero as the second
 * thing on the profile — breaks out to full width between the two grids.
 * Public viewers see only linked personas (the hook enforces this); self
 * view adds a manage link and a create prompt when empty. Preview counts as
 * a public view. The section-jump nav resumes in the second grid's rail,
 * sticky alongside "On the board", "Communities" and "Places" — the
 * sections it actually links to. Edit mode skips both grids entirely:
 * `EditableProfileHero` is a self-contained form, not a browsable profile,
 * so it doesn't need the section-jump rail.
 */
function DesktopProfileGrid({
  profile,
  isSelf,
  previewing,
  selfView,
  ownerSlug,
  restBelowHero,
  onEdit,
  onEditLinks,
  onPreview,
  onOpenWhoSeesWhat,
  onOpenAccountData,
  onToggleHidden,
}: {
  profile: MemberProfile;
  isSelf: boolean;
  previewing: boolean;
  selfView: boolean;
  ownerSlug: string;
  restBelowHero: ReactNode;
  onEdit: () => void;
  onEditLinks: () => void;
  onPreview: () => void;
  onOpenWhoSeesWhat: () => void;
  onOpenAccountData: () => void;
  onToggleHidden: () => void;
}) {
  const asVisitor = isSelf && previewing;
  return (
    <>
      <div className="wrap">
        <div className={styles.pageGrid}>
          <div className={styles.railCol}>
            <ProfileRail
              profile={profile}
              self={isSelf}
              asVisitor={asVisitor}
            />
          </div>
          <div className={styles.pageCol}>
            <ProfileHero
              profile={profile}
              self={isSelf}
              asVisitor={asVisitor}
              onEdit={onEdit}
              onEditLinks={onEditLinks}
              onPreview={onPreview}
              onOpenWhoSeesWhat={onOpenWhoSeesWhat}
              onOpenAccountData={onOpenAccountData}
              onToggleHidden={onToggleHidden}
              hiddenUntil={profile.hiddenUntil ?? null}
            />
          </div>
        </div>
      </div>

      <ProfileSubprofilesSection
        ownerSlug={ownerSlug}
        isSelf={selfView}
        previewing={asVisitor}
      />

      <div className="wrap">
        <div className={styles.pageGrid}>
          <div className={styles.railCol}>
            <ProfileSectionNavRail
              profile={profile}
              self={isSelf}
              asVisitor={asVisitor}
            />
          </div>
          <div className={styles.pageCol}>{restBelowHero}</div>
        </div>
      </div>
    </>
  );
}

export interface ProfileLayoutSwitchProps {
  profile: MemberProfile;
  isSelf: boolean;
  /** `isSelf && !previewing`. */
  selfView: boolean;
  previewing: boolean;
  isEditing: boolean;
  /** Jump the editor straight to its Links section on entry. */
  focusLinks: boolean;
  /** Phone-width layout, for both the view and the edit state. */
  useMobileLayout: boolean;
  otherMember: Member | null;
  ownerSlug: string;
  /** Below-hero sections without "Also working as" (desktop read-mode renders
   *  that one full-width between its two rail grids). */
  restBelowHero: ReactNode;
  /** Below-hero sections including "Also working as", for the edit layouts. */
  belowHero: ReactNode;
  onEdit: () => void;
  onEditLinks: () => void;
  onPreview: () => void;
  onOpenWhoSeesWhat: () => void;
  onOpenAccountData: () => void;
  onToggleHidden: () => void;
}

/**
 * Picks the profile body: phone or desktop, reading or editing. Four
 * combinations, and the only thing that varies between them is which hero
 * component wraps the same below-hero sections. Lifted out of `ProfilePage`
 * (with `DesktopProfileGrid` above it) so that component stays inside the
 * repo's 200-line rule; it holds no state.
 */
export function ProfileLayoutSwitch({
  profile,
  isSelf,
  selfView,
  previewing,
  isEditing,
  focusLinks,
  useMobileLayout,
  otherMember,
  ownerSlug,
  restBelowHero,
  belowHero,
  onEdit,
  onEditLinks,
  onPreview,
  onOpenWhoSeesWhat,
  onOpenAccountData,
  onToggleHidden,
}: ProfileLayoutSwitchProps) {
  const isEditingSelf = selfView && isEditing;

  if (useMobileLayout) {
    if (isEditingSelf) {
      return (
        <>
          <MobileEditableProfileHero focusLinks={focusLinks} />
          {belowHero}
        </>
      );
    }
    return (
      <MobileProfileView
        profile={profile}
        isSelf={isSelf}
        selfView={selfView}
        previewing={previewing}
        otherMember={otherMember}
        ownerSlug={ownerSlug}
        onEdit={onEdit}
        onEditLinks={onEditLinks}
        onPreview={onPreview}
        onOpenWhoSeesWhat={onOpenWhoSeesWhat}
        onOpenAccountData={onOpenAccountData}
        onToggleHidden={onToggleHidden}
      />
    );
  }

  if (isEditingSelf) {
    return (
      <>
        <EditableProfileHero focusLinks={focusLinks} />
        {belowHero}
      </>
    );
  }

  return (
    <DesktopProfileGrid
      profile={profile}
      isSelf={isSelf}
      previewing={previewing}
      selfView={selfView}
      ownerSlug={ownerSlug}
      restBelowHero={restBelowHero}
      onEdit={onEdit}
      onEditLinks={onEditLinks}
      onPreview={onPreview}
      onOpenWhoSeesWhat={onOpenWhoSeesWhat}
      onOpenAccountData={onOpenAccountData}
      onToggleHidden={onToggleHidden}
    />
  );
}
