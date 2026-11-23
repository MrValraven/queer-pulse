import {
  FiUserPlus,
  FiUserMinus,
  FiStar,
  FiX,
  FiShield,
  FiGift,
} from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { photoOf } from "./communityPeople";
import { RoleBadge } from "./CommunityBadges";
import { ModMemberMenu, type ModMemberMenuAction } from "./ModMemberMenu";
import { CommunityMemberAvatarRing } from "./badges/CommunityMemberAvatarRing";
import { CommunityMemberFlair } from "./badges/CommunityMemberFlair";
import styles from "./CommunityHubTabs.module.css";

type RosterMember = LivingCommunity["roster"][number];

export interface ModMemberRowActions {
  onPromote: (slug: string | undefined, name: string) => void;
  onDemote: (slug: string | undefined, name: string) => void;
  onGrantCoOwner: (slug: string | undefined, name: string) => void;
  onRevokeCoOwner: (slug: string | undefined, name: string) => void;
  onRemove: (slug: string | undefined, name: string) => void;
  onSendGift: (slug: string, name: string) => void;
}

/**
 * One roster row in mod tools. The role controls the *viewer* is actually
 * allowed to use live behind the row's `⋯` menu, so the row reads as a person
 * (avatar, name, role) rather than a line of competing verbs. The gates mirror
 * `CommunitiesService.setMemberRole` and `removeMember` exactly, so an item is
 * never offered that the server would answer with a 403:
 *
 * - Granting or revoking co-owner, and touching a co-owner's row at all, is
 *   the owner's alone (co-owner is owner-level; a co-owner who could appoint
 *   or unseat another could rebuild the community's governance without the
 *   owner).
 * - Changing or removing a *moderator* takes an owner-level actor, so a mod
 *   cannot dismantle the rest of the mod team.
 * - The owner's own row carries no controls: ownership moves only when a
 *   member accepts the owner's ownership offer.
 * - Sending a gift is open to every staff seat, on another member's row
 *   outside a space (`canSendGift`, decided by the list).
 */
export function ModMemberRow({
  member,
  communitySlug,
  role,
  viewerRole,
  canSendGift,
  actions,
}: {
  member: RosterMember;
  /** The community the row belongs to, for its worn badge and gifts. */
  communitySlug: string;
  /** The member's role including any not-yet-confirmed optimistic change. */
  role: CommunityRole;
  /** The signed-in moderator's own role in this community. */
  viewerRole: CommunityRole | null;
  /** Whether the menu offers "Send a gift" for this member. */
  canSendGift: boolean;
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

  const memberSlug = member.slug;
  const possibleActions: (ModMemberMenuAction | false)[] = [
    canSendGift &&
      memberSlug !== undefined && {
        key: "sendGift",
        label: t("communities:badges.sendGift"),
        icon: <FiGift />,
        run: () => actions.onSendGift(memberSlug, member.name),
      },
    !isOwner &&
      !isCoOwner &&
      !isMod &&
      canChangeThisRole && {
        key: "promote",
        label: t("communities:detail.modtools.members.makeModCta"),
        icon: <FiUserPlus />,
        run: () => actions.onPromote(member.slug, member.name),
      },
    !isOwner &&
      !isCoOwner &&
      isViewerOwner && {
        key: "grantCoOwner",
        label: t("communities:detail.modtools.members.makeCoOwnerCta"),
        icon: <FiStar />,
        run: () => actions.onGrantCoOwner(member.slug, member.name),
      },
    isCoOwner &&
      isViewerOwner && {
        key: "revokeCoOwner",
        label: t("communities:detail.modtools.members.removeCoOwnerCta"),
        icon: <FiUserMinus />,
        run: () => actions.onRevokeCoOwner(member.slug, member.name),
      },
    isMod &&
      canChangeThisRole && {
        key: "demote",
        label: t("communities:detail.modtools.members.demoteCta"),
        icon: <FiUserMinus />,
        run: () => actions.onDemote(member.slug, member.name),
      },
    !isOwner &&
      canChangeThisRole && {
        key: "remove",
        label: t("communities:detail.modtools.members.removeCta"),
        icon: <FiX />,
        run: () => actions.onRemove(member.slug, member.name),
        danger: true,
      },
  ];
  const menuActions = possibleActions.filter(
    (action): action is ModMemberMenuAction => action !== false,
  );

  return (
    <div className={styles.modRow}>
      <CommunityMemberAvatarRing communitySlug={communitySlug} member={member}>
        <Avatar
          initials={member.initials}
          tint={member.tint}
          src={photoOf(member, demoMode)}
          size={38}
          alt={member.name}
        />
      </CommunityMemberAvatarRing>
      <div className={styles.modMain}>
        <div className={styles.modName}>
          {member.name} <RoleBadge role={role} />
          <MemberStaffBadge slug={member.slug} />
          <CommunityMemberFlair communitySlug={communitySlug} member={member} />
        </div>
        {member.title && <div className={styles.modMeta}>{member.title}</div>}
      </div>
      <div className={styles.modActions}>
        {isOwner && (
          <span className={styles.ownerTag}>
            <FiShield aria-hidden />{" "}
            {t("communities:detail.modtools.members.ownerTag")}
          </span>
        )}
        <ModMemberMenu
          ariaLabel={t("communities:detail.modtools.members.actionsAria", {
            name: member.name,
          })}
          actions={menuActions}
        />
      </div>
    </div>
  );
}
