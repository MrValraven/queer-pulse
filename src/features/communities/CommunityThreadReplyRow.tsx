import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionText } from "../../shared/mentions/MentionText";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import { CommunityMemberAvatarRing } from "./badges/CommunityMemberAvatarRing";
import { CommunityMemberFlair } from "./badges/CommunityMemberFlair";
import { AV_CLASS } from "./communityAvatar";
import type { Reply } from "./communityDetails";
import { CommunityInlineTextEditor } from "./CommunityInlineTextEditor";
import styles from "./CommunityDetailPage.module.css";

/** One reply under a thread: avatar (ringed in the worn badge's tint), name,
 *  the worn badge and gift mark, the actions menu, then the text or its
 *  tombstone or inline editor. */
export function CommunityThreadReplyRow({
  reply,
  communitySlug,
  demoMode,
  isEditing,
  isSavingEdit,
  canReport,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
  onHistory,
  onReport,
}: {
  reply: Reply;
  communitySlug: string;
  demoMode: boolean;
  isEditing: boolean;
  /** True while this row's edit is being saved. */
  isSavingEdit: boolean;
  canReport: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (text: string) => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const owned = demoMode && reply.name === "You";
  const canEdit = demoMode ? owned && !reply.deleted : !!reply.canEdit;
  const canDelete = demoMode ? owned && !reply.deleted : !!reply.canDelete;
  const canRestore = demoMode ? owned && !!reply.deleted : !!reply.canRestore;
  const canViewHistory = demoMode ? false : !!reply.canViewHistory;
  const author = {
    slug: reply.authorSlug,
    name: reply.name,
    flair: reply.flair,
    hasRecentGift: reply.hasRecentGift,
  };

  return (
    <div className={styles.reply}>
      {/* The ring wraps the avatar, so the avatar's own 2px top offset moves
          to a wrapper: a margin inside the ring would bend its circle. */}
      <span className={styles.rAvSlot}>
        <CommunityMemberAvatarRing
          communitySlug={communitySlug}
          member={author}
        >
          <div
            className={[
              styles.rAv,
              styles.rAvInSlot,
              AV_CLASS[reply.tint],
            ].join(" ")}
          >
            {reply.initials}
          </div>
        </CommunityMemberAvatarRing>
      </span>
      <div className={styles.rBody}>
        <div className={styles.rHead}>
          <span className={styles.rName}>{reply.name}</span>
          <CommunityMemberFlair communitySlug={communitySlug} member={author} />
          <span className={styles.rMenu}>
            <PostActionsMenu
              canEdit={canEdit}
              canDelete={canDelete}
              canRestore={canRestore}
              canViewHistory={canViewHistory}
              onEdit={onStartEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              onHistory={onHistory}
              canReport={canReport}
              onReport={onReport}
            />
          </span>
        </div>
        {reply.deleted ? (
          <div className={styles.tombstone}>
            {t("communities:detail.thread.tombstone")}
          </div>
        ) : isEditing ? (
          <CommunityInlineTextEditor
            initial={reply.text}
            isBusy={isSavingEdit}
            onCancel={onCancelEdit}
            onSave={onSaveEdit}
          />
        ) : (
          <div className={styles.rText}>
            <MentionText text={reply.text} />
            {reply.editedAt && (
              <span className={styles.editedMark}>
                {" "}
                {t("communities:detail.thread.editedMark")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
