import { Link } from "react-router-dom";
import { FiCheck, FiGift } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { RosterMember } from "./community.model";
import { photoOf } from "./communityPeople";
import { alsoIn } from "./communityConnections";
import { RoleBadge } from "./CommunityBadges";
import { RosterMessageButton } from "./RosterMessageButton";
import { CommunityMemberAvatarRing } from "./badges/CommunityMemberAvatarRing";
import { CommunityMemberFlair } from "./badges/CommunityMemberFlair";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";
import cardStyles from "./RosterMemberCard.module.css";
import inactiveStyles from "./inactiveMemberName.module.css";

interface RosterMemberCardProps {
  member: RosterMember;
  communitySlug: string;
  /** Staff viewing another member's card outside a space. */
  isGiftable: boolean;
  onSendGift: (member: RosterMember) => void;
}

/** One member card on the roster tab. The worn badge rings the avatar and
 *  chips beside the role pill; staff also get a "Send a gift" button next to
 *  the message button (a sibling of the name link and outside it). */
export function RosterMemberCard({
  member,
  communitySlug,
  isGiftable,
  onSendGift,
}: RosterMemberCardProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const others = alsoIn(member.slug, communitySlug, demoMode);

  return (
    <div className={detail.mCard}>
      <div className={styles.rosterAv}>
        <CommunityMemberAvatarRing
          communitySlug={communitySlug}
          member={member}
        >
          <Avatar
            initials={member.initials}
            tint={member.tint}
            src={photoOf(member, demoMode)}
            size={48}
            // The member's name is rendered as visible text right beside
            // this avatar (see .rosterName below), so the image is
            // decorative: omit `alt` (alt="") to avoid a screen reader
            // double-reading the name (axe image-redundant-alt).
            verified={member.verified}
          />
        </CommunityMemberAvatarRing>
      </div>
      <div className={styles.rosterName}>
        <span className={styles.nameRow}>
          {member.slug ? (
            <Link to={`/members/${member.slug}`} className={styles.rosterLink}>
              {member.name}
            </Link>
          ) : (
            <span
              className={
                member.isInactiveMember
                  ? inactiveStyles.inactiveName
                  : undefined
              }
            >
              {member.name}
            </span>
          )}
          <MemberStaffBadge slug={member.slug} />
        </span>
      </div>
      <div className={styles.rosterBadgeRow}>
        <RoleBadge role={member.role} />
        <CommunityMemberFlair communitySlug={communitySlug} member={member} />
        {member.verified && (
          <span className={styles.verified}>
            <FiCheck aria-hidden /> {t("communities:detail.roster.verified")}
          </span>
        )}
      </div>
      {member.title && <div className={detail.mRole}>{member.title}</div>}
      <div className={styles.rosterMeta}>
        {[member.pronouns, member.hood].filter(Boolean).join(" · ")}
      </div>
      {others.length > 0 && (
        <div className={styles.alsoIn}>
          {t("communities:detail.roster.alsoIn", { names: others.join(", ") })}
        </div>
      )}
      {/* An inactive member's stand-in has no profile to message or gift. */}
      {member.slug && !member.isInactiveMember && (
        <div className={cardStyles.actions}>
          <RosterMessageButton member={member} />
          {isGiftable && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("communities:badges.sendGiftAria", {
                name: member.name,
              })}
              onClick={() => onSendGift(member)}
            >
              <FiGift aria-hidden /> {t("communities:badges.sendGift")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
