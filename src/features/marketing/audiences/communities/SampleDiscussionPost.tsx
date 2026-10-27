import { FiCornerUpLeft } from "react-icons/fi";
import { Avatar } from "../../../../shared/components/ui/Avatar";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ReactionBar, RoleBadge } from "../../../communities/CommunityBadges";
import pulseStyles from "../../../communities/PulseTab.module.css";
import type { SampleDiscussion } from "./communitiesSample.data";

/**
 * A post on the collective's page, drawn as the Pulse feed draws one: the
 * author with their role badge, the words, and the reactions read-only. The
 * product post reads its permissions and replies from the server, so this
 * renders the same markup on the product's own stylesheet.
 */
export function SampleDiscussionPost({
  discussion,
}: {
  discussion: SampleDiscussion;
}) {
  const { t } = useTranslation();
  const { author, role, timeLabel, text, reactions, replyCount } = discussion;
  return (
    <article className={pulseStyles.post}>
      <header className={pulseStyles.pHead}>
        <Avatar
          initials={author.initials}
          tint={author.tint}
          src={author.avatarUrl ?? undefined}
          size={40}
          alt={author.name}
        />
        <div className={pulseStyles.pWho}>
          <div className={pulseStyles.pName}>
            {author.name} <RoleBadge role={role} />
          </div>
          <div className={pulseStyles.pTime}>{timeLabel}</div>
        </div>
      </header>
      <p className={pulseStyles.pBody}>{text}</p>
      <div className={pulseStyles.pFoot}>
        <ReactionBar reactions={reactions} readOnly />
        <span className={pulseStyles.replyCount}>
          <FiCornerUpLeft aria-hidden />
          {t("communities:detail.pulse.replyLabel", { count: replyCount })}
        </span>
      </div>
    </article>
  );
}
