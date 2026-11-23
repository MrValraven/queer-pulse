import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import { CommunityMemberAvatarRing } from "./badges/CommunityMemberAvatarRing";
import { CommunityMemberFlair } from "./badges/CommunityMemberFlair";
import type { PostReply } from "./community.model";
import { AV_CLASS } from "./communityAvatar";
import { useCommunityTime } from "./communityTime";
import styles from "./PulseTab.module.css";
import inactiveStyles from "./inactiveMemberName.module.css";

/** One reply in the preview: the initials box inside the author's badge ring,
 *  and the worn badge after the name and any staff mark. */
function PulsePostReplyRow({
  reply,
  communitySlug,
  canReport,
  onReport,
}: {
  reply: PostReply;
  communitySlug: string;
  canReport: boolean;
  onReport: () => void;
}) {
  const communityTime = useCommunityTime();
  return (
    <div className={styles.reply}>
      {/* The initials box keeps its 2px top offset on the outside, so the
          ring around it stays a circle. */}
      <span className={styles.rAvSlot}>
        <CommunityMemberAvatarRing
          communitySlug={communitySlug}
          member={reply.author}
        >
          <div className={[styles.rAv, AV_CLASS[reply.author.tint]].join(" ")}>
            {reply.author.initials}
          </div>
        </CommunityMemberAvatarRing>
      </span>
      <div className={styles.rBody}>
        <div className={styles.rHead}>
          <span className={styles.rName}>
            {reply.author.isInactiveMember ? (
              <span className={inactiveStyles.inactiveName}>
                {reply.author.name}
              </span>
            ) : (
              reply.author.name
            )}
          </span>{" "}
          <MemberStaffBadge slug={reply.author.slug} />
          <CommunityMemberFlair
            communitySlug={communitySlug}
            member={reply.author}
          />{" "}
          <span className={styles.rTime}>{communityTime.ago(reply)}</span>
          {canReport && (
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
                onReport={onReport}
              />
            </span>
          )}
        </div>
        <div className={styles.rText}>{reply.text}</div>
      </div>
    </div>
  );
}

/** The bounded reply preview under a Pulse post. Split out of `PulsePost` so
 *  that component stays inside the repo's 200-line limit. */
export function PulsePostReplies({
  replies,
  communitySlug,
  canReportReply,
  onReportReply,
}: {
  replies: PostReply[];
  communitySlug: string;
  canReportReply: (reply: PostReply) => boolean;
  onReportReply: (reply: PostReply) => void;
}) {
  return (
    <>
      {replies.map((reply, replyIndex) => (
        <PulsePostReplyRow
          key={reply.id ?? `${reply.author.name}-${replyIndex}`}
          reply={reply}
          communitySlug={communitySlug}
          canReport={canReportReply(reply)}
          onReport={() => onReportReply(reply)}
        />
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
