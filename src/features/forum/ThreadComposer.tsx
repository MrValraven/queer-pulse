import { useCallback, type RefObject } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ForumAvatar } from "./ForumAuthor";
import { useProfileData } from "../../app/providers/useProfile";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import {
  usePostImageAttach,
  type StagedPostImage,
} from "../communities/usePostImageAttach";
import { ForumImageAttach } from "./ForumImageAttach";
import {
  FORUM_DRAFT_STATUS_LABEL_KEY,
  useForumComposerDraft,
  type ForumDraftStatus,
} from "./useForumComposerDraft";
import styles from "./ThreadPage.module.css";

export function ThreadComposer({
  authorName,
  reply,
  setReply,
  onPost,
  textareaRef,
  draft,
}: {
  authorName: string;
  reply: string;
  setReply: (v: string) => void;
  /** The staged photo carries BOTH halves: `key` is what the reply endpoint
   *  persists, `previewUrl` is the local blob the optimistic reply renders
   *  while the server's own `/files/` URL is still a round-trip away. */
  onPost: (body: string, image?: StagedPostImage) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Autosave this composer's text under a stable draft id. Passed by BOTH
   *  the bottom composer (keyed to the thread) and every inline nested-reply
   *  composer (keyed to the thread AND the reply being answered, see
   *  `nestedReplyDraftId`). The inline one is where quotes and threaded
   *  answers get written, and used to lose them on a mis-tap (PRD-166).
   *  Omitted only while a composer has no thread to belong to yet. */
  draft?: { draftId: string; title: string; href: string };
}) {
  const { t } = useTranslation();
  // The signed-in member, mode-aware: the real user in live, the mock persona in
  // demo, so the composer keeps the demo persona's avatar out of production.
  const { profile } = useProfileData();
  // The shared presigned upload pipeline, same hook the community composers
  // use. Owned here in the composer itself, so both the bottom composer and
  // every inline nested one get it without any plumbing.
  const attach = usePostImageAttach();
  const onRestore = useCallback((body: string) => setReply(body), [setReply]);
  const { status: draftStatus, clearDraft } = useForumComposerDraft({
    draftId: draft?.draftId ?? "",
    body: reply,
    onRestore,
    title: draft?.title ?? "",
    href: draft?.href ?? "",
    kind: t("forum:draft.replyKind"),
    isEnabled: !!draft,
  });

  function post() {
    const body = reply.trim();
    if (!body) return;
    onPost(body, attach.image ?? undefined);
    attach.remove();
    void clearDraft();
  }

  return (
    <div className={styles.compose}>
      <div className={styles.crHead}>
        {/* `name` becomes the avatar's alt text, so it has to be translated
            (it was a hardcoded English "You" in every locale). */}
        <ForumAvatar
          className={styles.crAv}
          person={{
            photo: profile.photo,
            initials: profile.initials,
            name: t("forum:author.you"),
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
        aria-label={t("forum:threadComposer.textareaAria")}
        value={reply}
        onChange={setReply}
      />
      <div className={styles.crFooter}>
        <ForumImageAttach
          attach={attach}
          buttonLabel={t("forum:compose.imageAttachReplyAria")}
        />
        <ComposerDraftStatus status={draftStatus} />
        <Button disabled={!reply.trim() || attach.uploading} onClick={post}>
          {t("forum:threadComposer.postReplyCta")}
        </Button>
      </div>
    </div>
  );
}

/** The quiet "we have your text" line under a composer. Empty until there is
 *  something true to say, so an untouched composer stays silent. The live
 *  region itself stays mounted, so its first reading is announced too.
 *
 *  "Not saved yet" is the one reading that asks for attention: it turns danger
 *  red and leads with an alert icon, matching the page composer's footer. */
function ComposerDraftStatus({ status }: { status: ForumDraftStatus }) {
  const { t } = useTranslation();
  const isFailed = status === "unsaved";
  return (
    <span
      className={styles.draftStatus}
      data-state={isFailed ? "failed" : undefined}
      role="status"
    >
      {isFailed && <FiAlertCircle aria-hidden="true" />}
      {status !== "idle" && t(FORUM_DRAFT_STATUS_LABEL_KEY[status])}
    </span>
  );
}
