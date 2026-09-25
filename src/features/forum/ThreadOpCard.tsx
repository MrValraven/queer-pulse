import { useId } from "react";
import { FiHeart, FiTag } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Thread, type ThreadPoll } from "./forum.data";
import { MarkdownLite } from "../../shared/markdown";
import { FeatureHelp } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { ForumPostPhotos } from "./ForumPostPhotos";
import { ForumLinkPreview } from "./ForumLinkPreview";
import {
  ContentWarningPill,
  ContentWarningReveal,
} from "./ForumContentWarning";
import { useContentWarningReveal } from "./forumWarnings.helpers";
import { ThreadOpCardHead } from "./ThreadOpCardHead";
import { ThreadOpMeta, ThreadStateNotice } from "./ThreadOpNotices";
import { ThreadPollCard } from "./ThreadPollCard";
import { firstLinkIn, useInViewOnce } from "./api/useForumLinkPreview";
import styles from "./ThreadPage.module.css";

export function ThreadOpCard({
  thread,
  title,
  body,
  editedAt,
  deleted,
  onVote,
  bookmarked,
  onToggleBookmark,
  onReport,
  canEdit,
  canDelete,
  canRestore,
  canViewHistory,
  onEdit,
  onDelete,
  onRestore,
  onHistory,
  onMoveCategory,
  onEditTags,
  poll,
  onPollVote,
  isPollVoting,
  pollError,
}: {
  thread: Thread;
  title: string;
  body: string[];
  editedAt: string | null;
  deleted: boolean;
  /** Cast/retract the viewer's vote on the opening post. Pressed-state and the
   *  count are read straight off the thread view-model (`myVote`/`upvotes`),
   *  which the vote mutation patches in place — no local like state. */
  onVote: () => void;
  bookmarked: boolean;
  /** Toggle whether this thread is in the member's saved items. Persisted via
   *  the app-wide saved store (real `/me/saved` endpoint, optimistic). */
  onToggleBookmark: () => void;
  onReport: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
  /** Re-file this thread into another category (PRD-163). Omitted for a viewer
   *  outside the author's 24-hour window who is not a moderator, which is what
   *  keeps the affordance off a menu the server would refuse. */
  onMoveCategory?: () => void;
  /** Open the tag editor (SOC-13). Omitted for a viewer who may not re-file
   *  this thread, which is what hides the control. */
  onEditTags?: () => void;
  /** The ballot as `useThreadPoll` resolves it (the thread's own, or the one a
   *  ballot just came back with). Null when the thread carries no poll. */
  poll: ThreadPoll | null;
  onPollVote: (optionIds: string[]) => void;
  isPollVoting: boolean;
  pollError: "closed" | "failed" | null;
}) {
  const { t } = useTranslation();
  const bodyId = useId();
  // ENG-130. Explicit `false` only: undefined is "the posts page has not landed
  // yet", which must read as loading rather than as a missing opening post.
  const isOpUnavailable = thread.isOpAvailable === false;
  // PRD-171: unfurl the first link in the opening post, and only once the card
  // is near the viewport (see `useForumLinkPreview` on the shared rate budget).
  const { ref: bodyRef, isInView } = useInViewOnce<HTMLDivElement>();
  const firstLink = firstLinkIn(body);

  // The author's warnings cover the post until a reader chooses otherwise, and
  // that choice is remembered for this thread for the rest of the session. A
  // tombstoned or withheld post has nothing left to cover.
  const hasWarnings = !!thread.contentWarnings?.length;
  const { isRevealed, reveal, cover } = useContentWarningReveal(
    thread.slug ?? String(thread.id),
  );
  const isCovered = hasWarnings && !deleted && !isOpUnavailable && !isRevealed;

  return (
    <div className={styles.opCard}>
      <ThreadOpCardHead
        thread={thread}
        editedAt={editedAt}
        canEdit={canEdit}
        canDelete={canDelete}
        canRestore={canRestore}
        canViewHistory={canViewHistory}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        onHistory={onHistory}
        onMoveCategory={onMoveCategory}
      />
      <ThreadStateNotice thread={thread} />
      <h1 className={styles.opTitle}>
        {title} <FeatureHelp id="forum.thread" />
      </h1>
      {hasWarnings && !deleted && !isOpUnavailable && (
        <div className={styles.opWarning}>
          <ContentWarningPill
            warnings={thread.contentWarnings}
            className={styles.warningPill}
          />
          <ContentWarningReveal
            warnings={thread.contentWarnings}
            isRevealed={isRevealed}
            onToggle={isRevealed ? cover : reveal}
            controlsId={bodyId}
            className={styles.warningReveal}
          />
        </div>
      )}
      <div
        id={bodyId}
        // The words stay in the DOM and go unreadable, so uncovering them is
        // instant and costs no second request. A blur is no cover at all to a
        // screen reader or to a keyboard, so the covered region is hidden from
        // assistive tech AND made inert: nothing inside it can be read out, and
        // no link inside it can take focus behind the blur.
        aria-hidden={isCovered || undefined}
        inert={isCovered}
        className={[styles.opBody, isCovered && styles.opBodyCovered]
          .filter(Boolean)
          .join(" ")}
        ref={bodyRef}
      >
        {isOpUnavailable ? (
          // The server told us there is no opening post THIS viewer can see.
          // State that and nothing else: the reason (a mute, a block, a
          // moderator's hand, a thread with no OP row) is not ours to guess at,
          // and every reply that did come back is rendered below.
          <p className={styles.opUnavailable}>
            {t("forum:threadOp.unavailable")}
          </p>
        ) : deleted ? (
          <p className={styles.tombstone}>
            {t(
              thread.removedByModerator
                ? "forum:tombstone.removedByModerator"
                : "forum:tombstone.body",
            )}
          </p>
        ) : (
          <>
            {/* `body` is the paragraph array the adapters split the raw post
                into, and `join("\n")` is the exact inverse the edit flow
                already relies on (`ThreadOpSection` seeds the editor with
                `opBody.join("\n")`). Reassembling it here is what lets one
                markdown-lite pass see the lists, quotes and headings that span
                more than a single paragraph, and keeps the composer's preview
                and the published post rendering the same source. */}
            <MarkdownLite text={body.join("\n")} />
            {/* ONE gallery. The backend has already folded the legacy single
                `opImage` into it, so that field is only reached for on a demo
                fixture, which never went through the reconciliation. */}
            <ForumPostPhotos
              photos={thread.opPhotos}
              legacyImage={thread.opImage}
            />
            <ForumLinkPreview url={firstLink} isEnabled={isInView} />
          </>
        )}
      </div>
      {poll && !deleted && !isOpUnavailable && (
        <ThreadPollCard
          poll={poll}
          onVote={onPollVote}
          isVoting={isPollVoting}
          error={pollError}
        />
      )}
      <ThreadOpMeta
        neighbourhood={thread.neighbourhood}
        language={thread.language}
      />
      <OpTagsRow tags={thread.tags} onEditTags={onEditTags} />
      {!deleted && !isOpUnavailable && (
        <OpFooterActions
          upvotes={thread.upvotes}
          voted={!!thread.myVote}
          onVote={onVote}
          bookmarked={bookmarked}
          onToggleBookmark={onToggleBookmark}
          onReport={onReport}
        />
      )}
    </div>
  );
}

/** The thread's tag chips, plus the re-file control for whoever may use it.
 *  Extracted so `ThreadOpCard` itself stays inside the 200-line component
 *  budget as the card grew a tag editor and a photo. */
function OpTagsRow({
  tags,
  onEditTags,
}: {
  tags: string[];
  onEditTags?: () => void;
}) {
  const { t } = useTranslation();
  if (!tags.length && !onEditTags) return null;
  return (
    <div className={styles.opTags}>
      {tags.map((tag) => (
        <span key={tag} className={styles.opTag}>
          {tag}
        </span>
      ))}
      {onEditTags && (
        <button type="button" className={styles.opTagEdit} onClick={onEditTags}>
          <FiTag aria-hidden="true" />
          {t(tags.length ? "forum:tagsEdit.editCta" : "forum:tagsEdit.addCta")}
        </button>
      )}
    </div>
  );
}

/** Upvote / save / report, under the opening post. */
function OpFooterActions({
  upvotes,
  voted,
  onVote,
  bookmarked,
  onToggleBookmark,
  onReport,
}: {
  upvotes: number;
  voted: boolean;
  onVote: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.opFooter}>
      <button
        type="button"
        aria-pressed={voted}
        aria-label={
          voted ? t("forum:threadOp.unvoteAria") : t("forum:threadOp.voteAria")
        }
        className={[styles.reaction, voted && styles.reactionOn]
          .filter(Boolean)
          .join(" ")}
        onClick={onVote}
      >
        {/* Same icon as the reply like button (ThreadReplyItem), so the OP
            and its replies no longer carry two different heart glyphs. */}
        <FiHeart aria-hidden="true" />{" "}
        <RollingNumber value={fmt.number(upvotes)} numericValue={upvotes} />
      </button>
      <button
        type="button"
        className={[styles.reaction, bookmarked && styles.reactionOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={bookmarked}
        onClick={onToggleBookmark}
      >
        {bookmarked ? t("forum:threadOp.saved") : t("forum:threadOp.bookmark")}
      </button>
      <button type="button" className={styles.report} onClick={onReport}>
        {t("forum:threadOp.report")}
      </button>
    </div>
  );
}
