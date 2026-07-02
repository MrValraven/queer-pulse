import { type RefObject } from "react";
import { Button } from "../../shared/components/ui";
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
          Replying to <strong>{authorName}</strong>
        </span>
      </div>
      <textarea
        ref={textareaRef}
        className={styles.crTextarea}
        placeholder="Write a reply…"
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
          Post reply
        </Button>
      </div>
    </div>
  );
}
