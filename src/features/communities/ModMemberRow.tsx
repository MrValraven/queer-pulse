import { FiUserPlus, FiUserMinus, FiStar, FiX, FiShield } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { photoOf } from "./communityPeople";
import { RoleBadge } from "./CommunityBadges";
import styles from "./CommunityHubTabs.module.css";

type RosterMember = LivingCommunity["roster"][number];

export interface ModMemberRowActions {
  onPromote: (slug: string | undefined, name: string) => void;
  onDemote: (slug: string | undefined, name: string) => void;
  onGrantCoOwner: (slug: string | undefined, name: string) => void;
  onRevokeCoOwner: (slug: string | undefined, name: string) => void;
  onRemove: (slug: string | undefined, name: string) => void;
}

/**
 * One roster row in mod tools, with the role controls the *viewer* is actually
 * allowed to use. The gates mirror `CommunitiesService.setMemberRole` and
 * `removeMember` exactly, so a button is never offered that the server would
 * answer with a 403:
 *
 * - Granting or revoking co-owner, and touching a co-owner's row at all, is
 *   the owner's alone (co-owner is owner-level; a co-owner who could appoint
 *   or unseat another could rebuild the community's governance without the
 *   owner).
 * - Changing or removing a *moderator* takes an owner-level actor, so a mod
 *   cannot dismantle the rest of the mod team.
 * - The owner's own row carries no controls: ownership moves through transfer.
 */
export function ModMemberRow({
  member,
  role,
  viewerRole,
  actions,
}: {
  member: RosterMember;
  /** The member's role including any not-yet-confirmed optimistic change. */
  role: CommunityRole;
  /** The signed-in moderator's own role in this community. */
  viewerRole: CommunityRole | null;
  actions: ModMemberRowActions;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  const isOwner = role === "owner";
  const isCoOwner = role === "co_owner";
  const isMod = role === "mod";
  const isViewerOwner = viewerRole === "owner";
  const isViewerOwnerLevel = isViewerOwner || viewerRole === "co_owner";

  const canChangeThisRole = isCoOwner
    ? isViewerOwner
    : isMod
      ? isViewerOwnerLevel
      : true;

  return (
    <div className={styles.modRow}>
      <Avatar
        initials={member.initials}
        tint={member.tint}
        src={photoOf(member, demoMode)}
        size={38}
        alt={member.name}
      />
      <div className={styles.modMain}>
        <div className={styles.modName}>
          {member.name} <RoleBadge role={role} />
          <MemberStaffBadge slug={member.slug} />
        </div>
        {member.title && <div className={styles.modMeta}>{member.title}</div>}
      </div>
      <div className={styles.modActions}>
        {!isOwner && !isCoOwner && !isMod && canChangeThisRole && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.declineBtn}
            onClick={() => actions.onPromote(member.slug, member.name)}
          >
            <FiUserPlus aria-hidden />{" "}
            {t("communities:detail.modtools.members.makeModCta")}
          </Button>
        )}
        {!isOwner && !isCoOwner && isViewerOwner && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.declineBtn}
            onClick={() => actions.onGrantCoOwner(member.slug, member.name)}
          >
            <FiStar aria-hidden />{" "}
            {t("communities:detail.modtools.members.makeCoOwnerCta")}
          </Button>
        )}
        {isCoOwner && isViewerOwner && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.declineBtn}
            onClick={() => actions.onRevokeCoOwner(member.slug, member.name)}
          >
            <FiUserMinus aria-hidden />{" "}
            {t("communities:detail.modtools.members.removeCoOwnerCta")}
          </Button>
        )}
        {isMod && canChangeThisRole && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.declineBtn}
            onClick={() => actions.onDemote(member.slug, member.name)}
          >
            <FiUserMinus aria-hidden />{" "}
            {t("communities:detail.modtools.members.demoteCta")}
          </Button>
        )}
        {!isOwner && canChangeThisRole && (
          <Button
            variant="ghost"
            size="sm"
            className={[styles.declineBtn, styles.removeBtn].join(" ")}
            onClick={() => actions.onRemove(member.slug, member.name)}
          >
            <FiX aria-hidden />{" "}
            {t("communities:detail.modtools.members.removeCta")}
          </Button>
        )}
        {isOwner && (
          <span className={styles.ownerTag}>
            <FiShield aria-hidden />{" "}
            {t("communities:detail.modtools.members.ownerTag")}
          </span>
        )}
      </div>
    </div>
  );
}
