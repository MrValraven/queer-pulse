import { useCallback, type RefObject } from "react";
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
import { useForumComposerDraft } from "./useForumComposerDraft";
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
  /** Autosave this composer's text under a stable draft id. Omitted on the
   *  inline nested-reply composers, whose text is a few seconds old at most
   *  and belongs to a target that disappears when the composer closes. */
  draft?: { draftId: string; title: string; href: string };
}) {
  const { t } = useTranslation();
  // The signed-in member, mode-aware: the real user in live, the mock persona in
  // demo — so the composer never borrows the demo persona's avatar in production.
  const { profile } = useProfileData();
  // The shared presigned upload pipeline, same hook the community composers
  // use. Owned here rather than threaded down from the thread page, so both the
  // bottom composer and every inline nested one get it without any plumbing.
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

/** The quiet "we have your text" line under a composer. Renders nothing until
 *  there is something true to say, so an untouched composer stays silent. */
function ComposerDraftStatus({
  status,
}: {
  status: "idle" | "saving" | "saved" | "restored";
}) {
  const { t } = useTranslation();
  if (status === "idle") return null;
  // An explicit map, not an interpolated key: every key a catalog has to carry
  // stays greppable, and the en/pt parity check can see all three.
  const labelKey =
    status === "saving"
      ? "forum:draft.saving"
      : status === "saved"
        ? "forum:draft.saved"
        : "forum:draft.restored";
  return (
    <span className={styles.draftStatus} role="status">
      {t(labelKey)}
    </span>
  );
}
