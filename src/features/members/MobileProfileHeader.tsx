import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MobileProfileIdentity } from "./MobileProfileIdentity";
import { MobileProfileStats } from "./MobileProfileStats";
import { ProfileHeroActions } from "./ProfileHeroActions";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";
import styles from "./MobileProfile.module.css";

function VerifiedCheck() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4 4L19 7"
        stroke="var(--cream)"
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
 * beneath it, and a full-width action row. Shows exactly the same data as
 * the desktop `ProfileHero` (`ProfileSections.tsx`) — same self/visitor
 * gating, same sub-pieces — just restructured for a single narrow column.
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
}) {
  const { t } = useTranslation();
  // Mirrors ProfileHero exactly: `self` is resolved by the page against the
  // authenticated user; `asVisitor` (preview-as-visitor) hides self-only
  // affordances without changing whose data is shown.
  const realSelf = self;
  const isSelf = realSelf && !asVisitor;

  return (
    <header className={styles.mheader}>
      <div className={styles.topRow}>
        <div className={styles.ringWrap}>
          <div className={styles.prideRing}>
            <div className={styles.ringGap}>
              <ImageSlot
                tint={profile.tint === "auth" ? "plum" : profile.tint}
                src={profile.photo}
                initials={profile.initials}
                shape="circle"
                width="100%"
                height="100%"
                srcSize={176}
                placeholder={`${profile.first} ${profile.last}`}
                alt={`${profile.first} ${profile.last}`}
              />
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
      </div>

      <MobileProfileIdentity
        profile={profile}
        isSelf={isSelf}
        onEditLinks={onEditLinks}
      />

      <div className={styles.actionRow}>
        <div className={styles.actionsSlot}>
          <ProfileHeroActions
            profile={profile}
            isSelf={isSelf}
            asVisitor={asVisitor}
            realSelf={realSelf}
            onEdit={onEdit}
            onPreview={onPreview}
          />
        </div>
        {/* Safety controls only on another member's profile — never your own
            (realSelf covers both self view and self-as-visitor preview). */}
        {!realSelf && (
          <div className={styles.safetySlot}>
            <ProfileSafetyMenu
              slug={profile.slug}
              firstName={profile.first}
            />
          </div>
        )}
      </div>
    </header>
  );
}
