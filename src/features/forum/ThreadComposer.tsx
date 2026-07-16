import { type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ForumAvatar } from "./ForumAuthor";
import { currentUser } from "../members/data/members";
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
  return (
    <div className={styles.compose}>
      <div className={styles.crHead}>
        <ForumAvatar
          className={styles.crAv}
          person={{
            photo: currentUser.photo,
            initials: currentUser.initials,
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
      <textarea
        ref={textareaRef}
        className={styles.crTextarea}
        placeholder={t("forum:threadComposer.placeholder")}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
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
