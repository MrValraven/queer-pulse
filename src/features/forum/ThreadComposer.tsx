import { type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ForumAvatar } from "./ForumAuthor";
import { useProfile } from "../../app/providers/ProfileProvider";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import styles from "./ThreadPage.module.css";

export function ThreadComposer({
  authorName,
  reply,
  setReply,
  onPost,
  textareaRef,
}: {
  authorName: string;
  reply: string;
  setReply: (v: string) => void;
  onPost: (body: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const { t } = useTranslation();
  // The signed-in member, mode-aware: the real user in live, the mock persona in
  // demo — so the composer never borrows the demo persona's avatar in production.
  const { profile } = useProfile();
  return (
    <div className={styles.compose}>
      <div className={styles.crHead}>
        <ForumAvatar
          className={styles.crAv}
          person={{
            photo: profile.photo,
            initials: profile.initials,
            name: "You",
          }}
        />
        <span>
          <Translation
            i18nKey="forum:threadComposer.replyingTo"
            components={{ strong: <strong /> }}
            values={{ name: authorName }}
          />
        </span>
      </div>
      <MentionTextarea
        textareaRef={textareaRef}
        className={styles.crTextarea}
        placeholder={t("forum:threadComposer.placeholder")}
        value={reply}
        onChange={setReply}
      />
      <div className={styles.crFooter}>
        <Button
          disabled={!reply.trim()}
          onClick={() => {
            const body = reply.trim();
            if (body) onPost(body);
          }}
        >
          {t("forum:threadComposer.postReplyCta")}
        </Button>
      </div>
    </div>
  );
}
