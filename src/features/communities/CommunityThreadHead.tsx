import { FiChevronUp, FiMessageCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import type { Thread as ThreadData } from "./communityDetails";
import { AV_CLASS } from "./communityAvatar";
import styles from "./CommunityDetailPage.module.css";

// The OP header: vote button + title + meta row + the OP's own actions menu.
// Presentational only — all state (open/voted/edit/delete/restore/history)
// lives in the CommunityThread orchestrator and is passed down as props.
export function CommunityThreadHead({
  data,
  open,
  onToggleOpen,
  voted,
  onToggleVote,
  opDeleted,
  opEditedAt,
  opCanEdit,
  opCanDelete,
  opCanRestore,
  opCanViewHistory,
  onEditOp,
  onDeleteOp,
  onRestoreOp,
  onHistoryOp,
}: {
  data: ThreadData;
  open: boolean;
  onToggleOpen: () => void;
  voted: boolean;
  onToggleVote: () => void;
  opDeleted: boolean;
  opEditedAt: string | null;
  opCanEdit: boolean;
  opCanDelete: boolean;
  opCanRestore: boolean;
  opCanViewHistory: boolean;
  onEditOp: () => void;
  onDeleteOp: () => void;
  onRestoreOp: () => void;
  onHistoryOp: () => void;
}) {
  const { t } = useTranslation();
  const voteCount =
    data.votes + (voted && !data.voted ? 1 : 0) - (!voted && data.voted ? 1 : 0);

  return (
    <div
      className={styles.thHead}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggleOpen();
        }
      }}
    >
      <div className={styles.thVote}>
        <button
          type="button"
          className={[styles.vbtn, voted && styles.vbtnVoted]
            .filter(Boolean)
            .join(" ")}
          aria-label={t("communities:detail.thread.upvoteAria")}
          aria-pressed={voted}
          onClick={(event) => {
            event.stopPropagation();
            onToggleVote();
          }}
        >
          <FiChevronUp aria-hidden />
        </button>
        <span className={styles.vnum}>{voteCount}</span>
      </div>
      <div className={styles.thMain}>
        <div className={styles.thTitle}>
          {opDeleted ? t("communities:detail.thread.tombstone") : data.title}
        </div>
        <div className={styles.thMeta}>
          <div className={[styles.thAv, AV_CLASS[data.author.tint]].join(" ")}>
            {data.author.initials}
          </div>
          <span className={styles.thName}>{data.author.name}</span>
          <MemberStaffBadge slug={data.author.slug} />
          <span>{data.time}</span>
          {opEditedAt && (
            <span className={styles.editedMark}>
              {t("communities:detail.thread.editedMark")}
            </span>
          )}
          <span className={styles.thReplies}>
            <FiMessageCircle />{" "}
            {t("communities:detail.thread.replies", { count: data.replyCount })}
          </span>
          <span
            className={styles.opMenu}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            role="presentation"
          >
            <PostActionsMenu
              canEdit={opCanEdit}
              canDelete={opCanDelete}
              canRestore={opCanRestore}
              canViewHistory={opCanViewHistory}
              onEdit={onEditOp}
              onDelete={onDeleteOp}
              onRestore={onRestoreOp}
              onHistory={onHistoryOp}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
