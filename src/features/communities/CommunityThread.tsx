import { useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Thread as ThreadData } from "./communityDetails";
import { AV_CLASS } from "./communityAvatar";
import { useReact, useUnreact, useReply } from "./api/useCommunityMutations";
import styles from "./CommunityDetailPage.module.css";

export function CommunityThread({
  data,
  slug,
}: {
  data: ThreadData;
  slug: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const react = useReact(slug);
  const unreact = useUnreact(slug);
  const reply = useReply(slug);

  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(!!data.voted);
  const [replyText, setReplyText] = useState("");
  const [extraReplies, setExtraReplies] = useState<{ name: string; text: string }[]>([]);

  const onError = () => showToast(t("communities:common.error"), "error");

  function toggleVote() {
    const next = !voted;
    setVoted(next);
    if (demoMode || !data.id) return;
    if (next) react.mutate({ id: data.id, key: "heart" }, { onError });
    else unreact.mutate({ id: data.id, key: "heart" }, { onError });
  }

  function postReply() {
    const text = replyText.trim();
    if (!text) return;
    setExtraReplies((prev) => [...prev, { name: "You", text }]);
    setReplyText("");
    showToast(t("communities:detail.thread.replyToast"), "success");
    if (demoMode || !data.id) return;
    reply.mutate({ id: data.id, text }, { onError });
  }

  return (
    <div className={styles.thread}>
      <div
        className={styles.thHead}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        <div className={styles.thVote}>
          <button
            type="button"
            className={[styles.vbtn, voted && styles.vbtnVoted]
              .filter(Boolean)
              .join(" ")}
            onClick={(event) => {
              event.stopPropagation();
              toggleVote();
            }}
          >
            ▲
          </button>
          <span className={styles.vnum}>
            {data.votes + (voted && !data.voted ? 1 : 0) - (!voted && data.voted ? 1 : 0)}
          </span>
        </div>
        <div className={styles.thMain}>
          <div className={styles.thTitle}>{data.title}</div>
          <div className={styles.thMeta}>
            <div className={[styles.thAv, AV_CLASS[data.author.tint]].join(" ")}>
              {data.author.initials}
            </div>
            <span className={styles.thName}>{data.author.name}</span>
            <MemberStaffBadge slug={data.author.slug} />
            <span>{data.time}</span>
            <span className={styles.thReplies}>
              <FiMessageCircle />{" "}
              {t("communities:detail.thread.replies", { count: data.replyCount })}
            </span>
          </div>
        </div>
      </div>
      {open && (
        <div className={styles.thBody}>
          <p className={styles.postText}>{data.post}</p>
          {data.replies.map((threadReply, index) => (
            <div className={styles.reply} key={threadReply.id ?? index}>
              <div className={[styles.rAv, AV_CLASS[threadReply.tint]].join(" ")}>
                {threadReply.initials}
              </div>
              <div>
                <div className={styles.rName}>{threadReply.name}</div>
                <div className={styles.rText}>{threadReply.text}</div>
              </div>
            </div>
          ))}
          {extraReplies.map((localReply, index) => (
            <div className={styles.reply} key={`local-${index}`}>
              <div className={[styles.rAv, styles.tPlum].join(" ")}>Me</div>
              <div>
                <div className={styles.rName}>{localReply.name}</div>
                <div className={styles.rText}>{localReply.text}</div>
              </div>
            </div>
          ))}
          <div className={styles.replyBar}>
            <div className={[styles.rAv, styles.tPlum].join(" ")}>Me</div>
            <textarea
              className={styles.replyTa}
              rows={1}
              placeholder={t("communities:detail.thread.replyPlaceholder")}
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
            />
            <Button
              variant="primary"
              onClick={postReply}
              style={{ padding: "9px 16px", fontSize: 13 }}
            >
              {t("communities:detail.thread.replyCta")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
