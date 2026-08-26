import { FiMessageCircle } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import type { Post } from "./community.model";
import { photoOf, roleLookup } from "./communityPeople";
import { RoleBadge } from "./CommunityBadges";
import { CopyPostLinkButton } from "./CopyPostLinkButton";
import { useCommunityTime } from "./communityTime";
import type { PulsePostPermissions } from "./usePulsePostState";
import detail from "./CommunityDetailPage.module.css";
import styles from "./PulseTab.module.css";

/** A Pulse post's byline row: author, relative time, and the actions menu.
 *  Split out of `PulsePost` to keep both components under the 200-line limit. */
export function PulsePostHeader({
  post,
  roleOf,
  permissions,
  editedAt,
  onEdit,
  onDelete,
  onRestore,
  onHistory,
  onTogglePin,
  onReport,
}: {
  post: Post;
  roleOf: (author: Post["author"]) => ReturnType<ReturnType<typeof roleLookup>>;
  permissions: PulsePostPermissions;
  editedAt: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
  onTogglePin: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const communityTime = useCommunityTime();
  const hasAnyAction =
    permissions.canPin ||
    permissions.canReport ||
    permissions.canEdit ||
    permissions.canDelete ||
    permissions.canRestore ||
    permissions.canViewHistory;
  // The permalink needs a post that actually exists at a URL. An optimistic
  // post the composer just added locally (`usePulseTabActions`'s `me-…` id)
  // has no server row yet, so it gets no copy-link control until the refetch
  // replaces it with the real one.
  const hasPermalink =
    Boolean(post.communitySlug) && !post.id.startsWith("me-");

  return (
    <header className={styles.pHead}>
      <Avatar
        initials={post.author.initials}
        tint={post.author.tint}
        src={photoOf(post.author, demoMode)}
        size={40}
        alt={post.author.name}
      />
      <div className={styles.pWho}>
        <div className={styles.pName}>
          {post.author.name} <MemberStaffBadge slug={post.author.slug} />{" "}
          <RoleBadge role={roleOf(post.author)} />
        </div>
        <div className={styles.pTime}>
          {communityTime.ago(post)}
          {editedAt && (
            <span className={detail.editedMark}>
              {" "}
              {t("communities:detail.thread.editedMark")}
            </span>
          )}
        </div>
      </div>
      <span className={styles.pActions}>
        {hasPermalink && (
          <CopyPostLinkButton
            communitySlug={post.communitySlug}
            postId={post.id}
          />
        )}
        {hasAnyAction && (
          <PostActionsMenu
            canEdit={permissions.canEdit}
            canDelete={permissions.canDelete}
            canRestore={permissions.canRestore}
            canViewHistory={permissions.canViewHistory}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onHistory={onHistory}
            canPin={permissions.canPin}
            pinned={!!post.pinned}
            onTogglePin={onTogglePin}
            canReport={permissions.canReport}
            onReport={onReport}
          />
        )}
      </span>
    </header>
  );
}

/** The "pinned announcement" flag above a pinned post. */
export function PulsePinnedFlag() {
  const { t } = useTranslation();
  return (
    <div className={styles.pinFlag}>
      <FiMessageCircle aria-hidden />{" "}
      {t("communities:detail.pulse.pinnedAnnouncement")}
    </div>
  );
}
