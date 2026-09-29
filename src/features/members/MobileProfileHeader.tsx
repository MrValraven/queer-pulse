import { useState } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MobileProfileActions } from "./MobileProfileActions";
import { MobileProfileIdentity } from "./MobileProfileIdentity";
import { MobileProfileIdentityTop } from "./MobileProfileIdentityTop";
import { MobileProfileOwnerActions } from "./MobileProfileOwnerActions";
import { MobileProfileStats } from "./MobileProfileStats";
import { ProfilePhotoViewer } from "./ProfilePhotoViewer";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";
import styles from "./MobileProfile.module.css";

function VerifiedCheck() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4 4L19 7"
        stroke="rgb(var(--cream-rgb))"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The Instagram-style header cluster for the mobile member profile: a
 * pride-ringed avatar beside the compact stat row, the full identity block
 * beneath it, and the equal-width action row right under it (Edit/Preview
 * for the owner, the CTA block for a visitor). Shows exactly the same data
 * as the desktop `ProfileHero` (`ProfileSections.tsx`), same self/visitor
 * gating, same sub-pieces, just restructured for a single narrow column.
 */
export function MobileProfileHeader({
  profile,
  self,
  asVisitor = false,
  previewing,
  otherMember,
  ownerSlug,
  onEdit,
  onEditLinks,
  onPreview,
  ...settingsHandlers
}: {
  profile: MemberProfile;
  self: boolean;
  asVisitor?: boolean;
  previewing: boolean;
  otherMember: Member | null;
  ownerSlug: string;
  onEdit?: () => void;
  onEditLinks?: () => void;
  onPreview?: () => void;
  /** Owner-only settings surfaces. Supplied together (the page hands over all
   *  three); rendered only on a genuine self view, outside the visitor
   *  preview (the same gate `ProfileHeroMain` applies on desktop). */
  onOpenWhoSeesWhat?: () => void;
  onOpenAccountData?: () => void;
  onToggleHidden?: () => void;
}) {
  const { t } = useTranslation();
  // Mirrors ProfileHero exactly: `self` is resolved by the page against the
  // authenticated user; `asVisitor` (preview-as-visitor) hides self-only
  // affordances without changing whose data is shown.
  const realSelf = self;
  const isSelf = realSelf && !asVisitor;
  const [photoOpen, setPhotoOpen] = useState(false);
  const actions = isSelf ? (
    <MobileProfileOwnerActions
      profile={profile}
      onEdit={onEdit}
      onPreview={onPreview}
      settingsHandlers={settingsHandlers}
    />
  ) : (
    <MobileProfileActions
      profile={profile}
      asVisitor={asVisitor}
      realSelf={realSelf}
    />
  );
  const fullName = `${profile.first} ${profile.last}`;
  const avatarTint = profile.tint === "auth" ? "plum" : profile.tint;
  const avatar = (
    <ImageSlot
      tint={avatarTint}
      src={profile.photo}
      initials={profile.initials}
      shape="circle"
      width="100%"
      height="100%"
      srcSize={176}
      placeholder={fullName}
      alt={fullName}
      crop={profile.avatarCrop}
    />
  );

  return (
    <header className={styles.mheader}>
      <div className={styles.identityCap}>
        <div className={styles.ringWrap}>
          <div className={styles.prideRing}>
            <div className={styles.ringGap}>
              {profile.photo ? (
                <button
                  type="button"
                  className={styles.photoButton}
                  onClick={() => setPhotoOpen(true)}
                  aria-label={t("members:profile.hero.viewPhotoAria", {
                    name: fullName,
                  })}
                >
                  {avatar}
                </button>
              ) : (
                avatar
              )}
            </div>
          </div>
          {profile.verified && (
            <span
              className={styles.verifiedBadge}
              role="img"
              aria-label={t("members:profile.hero.verifiedBadge")}
            >
              <VerifiedCheck />
            </span>
          )}
        </div>
        <MobileProfileIdentityTop profile={profile} isSelf={isSelf} />
      </div>

      {actions}

      <div className={styles.statsSlot}>
        <MobileProfileStats
          profile={profile}
          isSelf={isSelf}
          rawIsSelf={realSelf}
          otherMember={otherMember}
          previewing={previewing}
          ownerSlug={ownerSlug}
        />
      </div>

      <MobileProfileIdentity
        profile={profile}
        isSelf={isSelf}
        onEditLinks={onEditLinks}
      />

      {photoOpen && profile.photo && (
        <ProfilePhotoViewer
          src={profile.photo}
          name={fullName}
          tint={avatarTint}
          onClose={() => setPhotoOpen(false)}
        />
      )}
    </header>
  );
}
