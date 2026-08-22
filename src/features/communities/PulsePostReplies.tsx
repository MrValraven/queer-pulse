import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import type { PostReply } from "./community.model";
import { AV_CLASS } from "./communityAvatar";
import { useCommunityTime } from "./communityTime";
import styles from "./PulseTab.module.css";

/** The bounded reply preview under a Pulse post. Split out of `PulsePost` so
 *  that component stays inside the repo's 200-line limit. */
export function PulsePostReplies({
  replies,
  canReportReply,
  onReportReply,
}: {
  replies: PostReply[];
  canReportReply: (reply: PostReply) => boolean;
  onReportReply: (reply: PostReply) => void;
}) {
  const communityTime = useCommunityTime();
  return (
    <>
      {replies.map((reply, replyIndex) => (
        <div
          className={styles.reply}
          key={reply.id ?? `${reply.author.name}-${replyIndex}`}
        >
          <div className={[styles.rAv, AV_CLASS[reply.author.tint]].join(" ")}>
            {reply.author.initials}
          </div>
          <div className={styles.rBody}>
            <div className={styles.rHead}>
              <span className={styles.rName}>{reply.author.name}</span>{" "}
              <MemberStaffBadge slug={reply.author.slug} />{" "}
              <span className={styles.rTime}>{communityTime.ago(reply)}</span>
              {canReportReply(reply) && (
                <span className={styles.rMenu}>
                  <PostActionsMenu
                    canEdit={false}
                    canDelete={false}
                    canRestore={false}
                    canViewHistory={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onRestore={() => {}}
                    onHistory={() => {}}
                    canReport
                    onReport={() => onReportReply(reply)}
                  />
                </span>
              )}
            </div>
            <div className={styles.rText}>{reply.text}</div>
          </div>
        </div>
      ))}
    </>
  );
}

/** The inline "reply to this post" composer, shown once the reply toggle is on. */
export function PulseReplyBar({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.replyBar}>
      <textarea
        className={styles.replyTa}
        rows={1}
        aria-label={t("communities:detail.pulse.replyPlaceholder")}
        placeholder={t("communities:detail.pulse.replyPlaceholder")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button variant="ghost" style={{ fontSize: 13 }} onClick={onSend}>
        {t("communities:detail.pulse.replyAction")}
      </Button>
    </div>
  );
}
