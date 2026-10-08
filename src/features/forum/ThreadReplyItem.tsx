import { useState, type Ref } from "react";
import {
  FiStar,
  FiHeart,
  FiCheckCircle,
  FiCornerDownRight,
} from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply } from "./forum.data";
import { ProfileLink, OfficialBadge } from "./ForumAuthor";
import { authorHref } from "./forumAuthor.helpers";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { MarkdownLite } from "../../shared/markdown";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { PostActionsMenu } from "./PostActionsMenu";
import { type PostMenuAction } from "./usePostAuthorSafety";
import { ForumPostPhotos } from "./ForumPostPhotos";
import { ForumLinkPreview } from "./ForumLinkPreview";
import { firstLinkIn, useInViewOnce } from "./api/useForumLinkPreview";
import { ModeratorByline } from "./ThreadReplies";
import {
  ReplyCollapseButton,
  ReplyGutter,
  type ReplyGutterCollapse,
} from "./ReplyGutter";
import { useIsReplyBranchHidden } from "./replyBranchVisibility";
import styles from "./ThreadPage.module.css";

export function ThreadReplyItem({
  reply,
  index,
  replyKey,
  isLiked,
  toggleReplyLike,
  demoMode,
  demoOwns,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
  onHistory,
  onReply,
  onReport,
  onAcceptAnswer,
  onQuote,
  hasBranchBelow = false,
  collapse,
  collapseToggleRef,
  replyingToName,
}: {
  reply: Reply;
  index: number;
  replyKey: (reply: Reply) => string;
  isLiked: boolean;
  toggleReplyLike: (reply: Reply) => void;
  demoMode: boolean;
  demoOwns: (person: { slug?: string; isMine?: boolean }) => boolean;
  isEditing: boolean;
  onStartEdit: (reply: Reply) => void;
  onCancelEdit: () => void;
  onSaveEdit: (postId: string, body: string) => void;
  onDelete: (reply: Reply) => void;
  onRestore: (reply: Reply) => void;
  onHistory: (reply: Reply) => void;
  /** Nested-replies feature: renders a "Reply" action next to the like button
   *  when provided. Omitted call sites (none left) keep today's behaviour. */
  onReply?: (reply: Reply) => void;
  /** Adds "Report" to this reply's "..." menu, carrying its real `postId` as
   *  the report subject. Omitted leaves the menu without it. */
  onReport?: (reply: Reply) => void;
  /** Renders "Mark as answer" / "Unmark answer" (SOC-13). Omitted for a viewer
   *  who is neither the thread's author nor a moderator, so the row only ever
   *  offers an action the server will accept. */
  onAcceptAnswer?: (reply: Reply) => void;
  /** Renders "Quote", which opens a reply to this one prefilled with its text
   *  as a blockquote. Omitted where replying itself is withheld. */
  onQuote?: (reply: Reply) => void;
  /** True when anything renders under this reply in the tree (nested
   *  replies, a collapsed-branch row, or the inline composer), which is what
   *  draws the thread rail down from the avatar. */
  hasBranchBelow?: boolean;
  /** Collapse controls for a reply with nested replies: the clickable rail
   *  and the circled toggle in the gutter. */
  collapse?: ReplyGutterCollapse;
  collapseToggleRef?: Ref<HTMLButtonElement>;
  /** Set on a reply shown in a flattened "continue this thread" column whose
   *  parent is another row of that column: names who it answers, since the
   *  indent no longer shows it. */
  replyingToName?: string;
}) {
  const { t } = useTranslation();
  const replyIdentity = reply.postId ?? replyKey(reply);
  const canEdit = demoMode
    ? demoOwns(reply) && !reply.deleted
    : !!reply.canEdit;
  const canDelete = demoMode
    ? demoOwns(reply) && !reply.deleted
    : !!reply.canDelete;
  const canRestore = demoMode
    ? demoOwns(reply) && !!reply.deleted
    : !!reply.canRestore;
  const canViewHistory = demoMode ? false : !!reply.canViewHistory;
  // PRD-171: at most the FIRST link in this reply, requested only once the
  // reply nears the viewport (see the rate budget in `useForumLinkPreview`),
  // and never inside a collapsed branch, which stays mounted while hidden.
  const { ref: bodyRef, isInView } = useInViewOnce<HTMLDivElement>();
  const firstLink = firstLinkIn(reply.body);
  const isBranchHidden = useIsReplyBranchHidden();
  // Report always lives in the "..." menu. On a phone Quote and the answer
  // mark move there too; one set renders at a time, never a hidden duplicate.
  const isCompact = useMediaQuery(mediaMax("md"));
  const hasActionsRow = !reply.deleted && !isEditing;
  const overflow = hasActionsRow
    ? isCompact
      ? { onQuote, onAcceptAnswer, onReport }
      : { onReport }
    : {};
  return (
    <FadeIn
      delay={Math.min(index, 8) * 60}
      className={[
        styles.reply,
        (reply.helpful || reply.accepted) && styles.replyHighlighted,
        reply.accepted
          ? styles.replyAccepted
          : reply.helpful && styles.replyHelpful,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ReplyGutter
        reply={reply}
        hasBranchBelow={hasBranchBelow}
        collapse={collapse}
      />
      <div className={styles.replyContent}>
        <div className={styles.replyTop}>
          <ReplyAuthorLine reply={reply} />
          <ReplyMenu
            reply={reply}
            canEdit={canEdit}
            canDelete={canDelete}
            canRestore={canRestore}
            canViewHistory={canViewHistory}
            onStartEdit={onStartEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onHistory={onHistory}
            {...overflow}
          />
        </div>
        {reply.official && reply.mod && <ModeratorByline mod={reply.mod} />}
        {replyingToName && <ReplyingToLine name={replyingToName} />}
        {reply.deleted ? (
          <div className={styles.replyBody}>
            <p className={styles.tombstone}>
              {t(
                reply.removedByModerator
                  ? "forum:tombstone.removedByModerator"
                  : "forum:tombstone.body",
              )}
            </p>
          </div>
        ) : isEditing ? (
          <InlineReplyEditor
            initial={reply.body.join("\n")}
            onCancel={onCancelEdit}
            onSave={(next) => onSaveEdit(replyIdentity, next)}
          />
        ) : (
          <>
            <div className={styles.replyBody} ref={bodyRef}>
              {reply.quote && (
                <div className={styles.quote}>
                  {/* `cite` is absent when the quoted post is not in the
                      loaded page; the passage still stands on its own. */}
                  {reply.quote.cite && <cite>{reply.quote.cite}</cite>}
                  {reply.quote.text}
                </div>
              )}
              {/* Same reassembly as the opening post: `reply.body` is the
                  split form, and `join("\n")` is what the inline editor below
                  already treats as the raw body. One markdown-lite pass over
                  the whole reply is what makes a multi-line list or quote
                  render as one block. */}
              <MarkdownLite text={reply.body.join("\n")} />
              {/* ONE gallery, up to four. The backend folds a reply's legacy
                  single `image` into `photos` before it leaves the server, so
                  that field is only reached for on a demo reply or on an
                  optimistic one the member just posted. */}
              <ForumPostPhotos
                photos={reply.photos}
                legacyImage={reply.image}
              />
              <ForumLinkPreview
                url={firstLink}
                isEnabled={isInView && !isBranchHidden}
              />
            </div>
            <ReplyActionsRow
              reply={reply}
              isLiked={isLiked}
              toggleReplyLike={toggleReplyLike}
              onReply={onReply}
              onAcceptAnswer={isCompact ? undefined : onAcceptAnswer}
              onQuote={isCompact ? undefined : onQuote}
            />
          </>
        )}
      </div>
      {collapse && (
        <ReplyCollapseButton
          authorName={reply.name}
          descendantCount={collapse.descendantCount}
          isHidden={collapse.isCollapsed}
          onToggle={collapse.onToggle}
          buttonRef={collapseToggleRef}
        />
      )}
    </FadeIn>
  );
}

/** The reply's "..." menu: edit, history, restore, delete, Mute / Block and
 *  Report, plus, on a phone, the Quote / answer actions the compact actions
 *  row leaves out (passed only then). */
function ReplyMenu({
  reply,
  canEdit,
  canDelete,
  canRestore,
  canViewHistory,
  onStartEdit,
  onDelete,
  onRestore,
  onHistory,
  onQuote,
  onAcceptAnswer,
  onReport,
}: {
  reply: Reply;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  onStartEdit: (reply: Reply) => void;
  onDelete: (reply: Reply) => void;
  onRestore: (reply: Reply) => void;
  onHistory: (reply: Reply) => void;
  onQuote?: (reply: Reply) => void;
  onAcceptAnswer?: (reply: Reply) => void;
  onReport?: (reply: Reply) => void;
}) {
  const { t } = useTranslation();
  const overflowActions: PostMenuAction[] = [
    onQuote && {
      key: "reply-quote",
      label: t("forum:replies.quote"),
      run: () => onQuote(reply),
    },
    onAcceptAnswer && {
      key: "reply-accept",
      label: t(
        reply.accepted
          ? "forum:replies.unmarkAnswer"
          : "forum:replies.markAnswer",
      ),
      run: () => onAcceptAnswer(reply),
    },
    onReport && {
      key: "reply-report",
      label: t("forum:threadOp.report"),
      run: () => onReport(reply),
    },
  ].filter((action): action is PostMenuAction => Boolean(action));
  return (
    <span className={styles.replyMenu}>
      <PostActionsMenu
        canEdit={canEdit}
        canDelete={canDelete}
        canRestore={canRestore}
        canViewHistory={canViewHistory}
        // Adds Mute / Block for this reply's author (no-op on your own
        // replies and on the QueerPulse Official account).
        author={{
          slug: reply.slug,
          name: reply.name,
          official: reply.official,
        }}
        onEdit={() => onStartEdit(reply)}
        onDelete={() => onDelete(reply)}
        onRestore={() => onRestore(reply)}
        onHistory={() => onHistory(reply)}
        extraActions={overflowActions}
      />
    </span>
  );
}

/** Name, staff and official marks, badges and time. Wraps as one group, so on
 *  a narrow deep reply the badges and time drop to a second line while the
 *  actions menu stays pinned at the right of the row. */
function ReplyAuthorLine({ reply }: { reply: Reply }) {
  const { t } = useTranslation();
  const shouldShowEdited = !!reply.editedAt && !reply.deleted;
  return (
    <span className={styles.replyMeta}>
      <span className={styles.replyName}>
        <ProfileLink
          to={authorHref(reply)}
          name={reply.name}
          official={reply.official}
          className={styles.authorLink}
        >
          {reply.name}
        </ProfileLink>
      </span>
      <MemberStaffBadge slug={reply.slug} />
      {reply.official && <OfficialBadge />}
      <ReplyBadges reply={reply} />
      {/* An edited reply says so right after its time, grouped with it so
          the pair wraps as one unit. */}
      {shouldShowEdited ? (
        <span className={styles.replyTimeGroup}>
          <span className={styles.replyTime}>{reply.time}</span>
          <span className={styles.replyTime} aria-hidden="true">
            {"·"}
          </span>
          <span className={styles.replyTime}>{t("forum:edited.inline")}</span>
        </span>
      ) : (
        <span className={styles.replyTime}>{reply.time}</span>
      )}
    </span>
  );
}

/** The small markers on a reply's author line: original poster, the thread
 *  author's accepted-answer mark, and the demo mock's curated "most helpful"
 *  flag. The accepted mark outranks "most helpful" and replaces it where both
 *  could apply: one is the author's answer, the other a guess. */
function ReplyBadges({ reply }: { reply: Reply }) {
  const { t } = useTranslation();
  return (
    <>
      {reply.isOP && (
        <span className={styles.opBadge}>{t("forum:replies.opBadge")}</span>
      )}
      {reply.accepted && (
        <span className={styles.acceptedBadge}>
          <FiCheckCircle aria-hidden="true" />{" "}
          {t("forum:replies.acceptedBadge")}
        </span>
      )}
      {reply.helpful && !reply.accepted && (
        <span className={styles.helpfulBadge}>
          <FiStar /> {t("forum:replies.mostHelpfulBadge")}
        </span>
      )}
    </>
  );
}

/** The like / reply / quote / answer row under a reply body. Report lives in
 *  the "..." menu. */
function ReplyActionsRow({
  reply,
  isLiked,
  toggleReplyLike,
  onReply,
  onAcceptAnswer,
  onQuote,
}: {
  reply: Reply;
  isLiked: boolean;
  toggleReplyLike: (reply: Reply) => void;
  onReply?: (reply: Reply) => void;
  onAcceptAnswer?: (reply: Reply) => void;
  onQuote?: (reply: Reply) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.replyActions}>
      <button
        type="button"
        aria-pressed={isLiked}
        aria-label={
          isLiked ? t("forum:replies.unlikeAria") : t("forum:replies.likeAria")
        }
        className={[styles.replyReact, isLiked && styles.replyReactOn]
          .filter(Boolean)
          .join(" ")}
        onClick={() => toggleReplyLike(reply)}
      >
        {/* Raw server count: the vote mutation patches `reactions` in place,
            so a local `+1` here would double-count. */}
        <FiHeart aria-hidden="true" />{" "}
        <RollingNumber
          value={fmt.number(reply.reactions)}
          numericValue={reply.reactions}
        />
      </button>
      {onReply && (
        <button
          type="button"
          className={styles.replyReplyBtn}
          onClick={() => onReply(reply)}
        >
          {t("forum:replies.reply")}
        </button>
      )}
      {onQuote && (
        <button
          type="button"
          className={styles.replyReplyBtn}
          onClick={() => onQuote(reply)}
        >
          {t("forum:replies.quote")}
        </button>
      )}
      {onAcceptAnswer && (
        <button
          type="button"
          className={[
            styles.replyReplyBtn,
            reply.accepted && styles.replyAcceptOn,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={!!reply.accepted}
          onClick={() => onAcceptAnswer(reply)}
        >
          {t(
            reply.accepted
              ? "forum:replies.unmarkAnswer"
              : "forum:replies.markAnswer",
          )}
        </button>
      )}
    </div>
  );
}

/** "Replying to Ana", the small muted line a flattened reply carries above its
 *  body so the conversation still reads in order without the indent. */
function ReplyingToLine({ name }: { name: string }) {
  const { t } = useTranslation();
  return (
    <p className={styles.replyingTo}>
      <FiCornerDownRight aria-hidden="true" />
      {t("forum:replies.replyingTo", { name })}
    </p>
  );
}

function InlineReplyEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: string;
  onCancel: () => void;
  onSave: (next: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const trimmed = value.trim();
  return (
    <div className={styles.inlineEdit}>
      <MentionTextarea
        className={styles.inlineTextarea}
        aria-label={t("forum:replyEdit.textareaAria")}
        value={value}
        onChange={setValue}
        rows={4}
      />
      <div className={styles.inlineActions}>
        <Button variant="ghost" type="button" onClick={onCancel}>
          {t("forum:replyEdit.cancel")}
        </Button>
        <Button
          variant="primary"
          type="button"
          disabled={!trimmed || trimmed === initial}
          onClick={() => onSave(trimmed)}
        >
          {t("forum:replyEdit.save")}
        </Button>
      </div>
    </div>
  );
}
