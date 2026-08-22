import { FiChevronUp, FiMessageCircle } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import type { Thread as ThreadData } from "./communityDetails";
import { AV_CLASS } from "./communityAvatar";
import { useCommunityTime } from "./communityTime";
import styles from "./CommunityDetailPage.module.css";

// The OP header: vote control + title disclosure + meta row + the OP's own
// actions menu. Presentational only — all state (open/voted/edit/delete/
// restore/history/pin/report) lives in the CommunityThread orchestrator and is
// passed down as props.
//
// The three controls are SIBLINGS, deliberately. This row used to be one
// `role="button"` wrapper with the vote button and the actions menu nested
// inside it, which a screen reader announced as a single giant button, made
// keyboard users tab into controls "inside a button", and needed key events
// swallowed on a `role="presentation"` span to work at all. Only the title
// toggles the thread now.
export function CommunityThreadHead({
  data,
  isOpen,
  onToggleOpen,
  voted,
  onToggleVote,
  opDeleted,
  opEditedAt,
  opPinned,
  opCanEdit,
  opCanDelete,
  opCanRestore,
  opCanViewHistory,
  opCanPin,
  opCanReport,
  onEditOp,
  onDeleteOp,
  onRestoreOp,
  onHistoryOp,
  onTogglePinOp,
  onReportOp,
}: {
  data: ThreadData;
  isOpen: boolean;
  onToggleOpen: () => void;
  voted: boolean;
  onToggleVote: () => void;
  opDeleted: boolean;
  opEditedAt: string | null;
  opPinned: boolean;
  opCanEdit: boolean;
  opCanDelete: boolean;
  opCanRestore: boolean;
  opCanViewHistory: boolean;
  opCanPin: boolean;
  opCanReport: boolean;
  onEditOp: () => void;
  onDeleteOp: () => void;
  onRestoreOp: () => void;
  onHistoryOp: () => void;
  onTogglePinOp: () => void;
  onReportOp: () => void;
}) {
  const { t } = useTranslation();
  const communityTime = useCommunityTime();
  const voteCount =
    data.votes +
    (voted && !data.voted ? 1 : 0) -
    (!voted && data.voted ? 1 : 0);

  return (
    <div className={styles.thHead}>
      <div className={styles.thVote}>
        <IconButton
          className={[styles.vbtn, voted && styles.vbtnVoted]
            .filter(Boolean)
            .join(" ")}
          aria-label={t("communities:detail.thread.upvoteAria")}
          aria-pressed={voted}
          onClick={onToggleVote}
        >
          <FiChevronUp aria-hidden />
        </IconButton>
        <span className={styles.vnum}>{voteCount}</span>
      </div>
      <div className={styles.thMain}>
        {opPinned && !opDeleted && (
          <div className={styles.pinFlag}>
            <FiMessageCircle aria-hidden />{" "}
            {t("communities:detail.pulse.pinnedAnnouncement")}
          </div>
        )}
        <Button
          variant="ghost"
          className={[styles.thTitle, styles.thTitleBtn].join(" ")}
          aria-expanded={isOpen}
          onClick={onToggleOpen}
        >
          {opDeleted ? t("communities:detail.thread.tombstone") : data.title}
        </Button>
        <div className={styles.thMeta}>
          <div className={[styles.thAv, AV_CLASS[data.author.tint]].join(" ")}>
            {data.author.initials}
          </div>
          <span className={styles.thName}>{data.author.name}</span>
          <MemberStaffBadge slug={data.author.slug} />
          <span>{communityTime.plain(data)}</span>
          {opEditedAt && (
            <span className={styles.editedMark}>
              {t("communities:detail.thread.editedMark")}
            </span>
          )}
          <span className={styles.thReplies}>
            <FiMessageCircle />{" "}
            {t("communities:detail.thread.replies", { count: data.replyCount })}
          </span>
          <span className={styles.opMenu}>
            <PostActionsMenu
              canEdit={opCanEdit}
              canDelete={opCanDelete}
              canRestore={opCanRestore}
              canViewHistory={opCanViewHistory}
              onEdit={onEditOp}
              onDelete={onDeleteOp}
              onRestore={onRestoreOp}
              onHistory={onHistoryOp}
              canPin={opCanPin}
              pinned={opPinned}
              onTogglePin={onTogglePinOp}
              canReport={opCanReport}
              onReport={onReportOp}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
