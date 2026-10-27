import { FiChevronUp, FiMessageCircle } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AV_CLASS } from "../../../communities/communityAvatar";
import detailStyles from "../../../communities/CommunityDetailPage.module.css";
import { buildSampleThreads } from "./communitiesSteps.data";

/**
 * Two threads in the collective's Discussion tab, each drawn as
 * `CommunityThreadHead` draws a closed thread, on its own stylesheet: the
 * vote count, the title, who started it and when, and the replies. The
 * product head reads its permissions and menu from the server, so this
 * renders the same markup with the title as plain text.
 */
export function SampleDiscussionThreads() {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <div>
      {buildSampleThreads(t).map((thread) => (
        <div key={thread.threadId} className={detailStyles.thread}>
          <div className={detailStyles.thHead}>
            <div className={detailStyles.thVote}>
              <IconButton
                className={detailStyles.vbtn}
                aria-label={t("communities:detail.thread.upvoteAria")}
              >
                <FiChevronUp aria-hidden />
              </IconButton>
              <span className={detailStyles.vnum}>
                {format.number(thread.voteCount)}
              </span>
            </div>
            <div className={detailStyles.thMain}>
              <p className={detailStyles.thTitle}>{thread.title}</p>
              <div className={detailStyles.thMeta}>
                <span
                  className={[
                    detailStyles.thAv,
                    AV_CLASS[thread.author.tint],
                  ].join(" ")}
                  aria-hidden
                >
                  {thread.author.initials}
                </span>
                <span className={detailStyles.thName}>
                  {thread.author.name}
                </span>
                <span>{thread.timeLabel}</span>
                <span className={detailStyles.thReplies}>
                  <FiMessageCircle aria-hidden />{" "}
                  {t("communities:detail.thread.replies", {
                    count: thread.replyCount,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
