import { useState, type RefObject } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes, thread as threadPath } from "../../app/routeMap";
import { nestedReplyDraftId } from "./api/forumDrafts.api";
import { type Reply } from "./forum.data";
import {
  countDescendants,
  flattenReplyDescendants,
  type ReplyNode,
} from "./buildReplyTree";
import { ThreadReplyItem } from "./ThreadReplyItem";
import { ReplyBranchToggleRow } from "./ReplyBranchToggle";
import { ReplyBranchRegion } from "./ReplyBranchRegion";
import { replyBranchRowClassName } from "./replyBranchVisibility";
import { useReplyBranchFocus } from "./useReplyBranchFocus";
import { ThreadComposer } from "./ThreadComposer";
import type { StagedPostImage } from "../communities/usePostImageAttach";
import styles from "./ThreadPage.module.css";

/** The depth where nesting stops. A node here hides its subtree behind
 *  "Continue this thread", and once that opens, the rest of the branch renders
 *  as one flat column under it, so deep threads stay legible on a phone. */
const MAX_INDENT_DEPTH = 4;

interface ThreadReplyNodeProps {
  node: ReplyNode;
  index: number;
  replyKey: (reply: Reply) => string;
  /** When true, replies are closed: this node renders no "Reply" action and no
   *  inline composer (propagated to every descendant). */
  isLocked: boolean;
  likedReplies: Record<string, boolean>;
  toggleReplyLike: (reply: Reply) => void;
  demoMode: boolean;
  demoOwns: (person: { slug?: string; isMine?: boolean }) => boolean;
  editingReplyPostId: string | null;
  onStartEdit: (reply: Reply) => void;
  onCancelEdit: () => void;
  onSaveEdit: (postId: string, body: string) => void;
  onDelete: (reply: Reply) => void;
  onRestore: (reply: Reply) => void;
  onHistory: (reply: Reply) => void;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  activeReplyTargetId: string | null;
  onStartReply: (reply: Reply) => void;
  onCancelReply: () => void;
  onPostReply: (body: string, image?: StagedPostImage) => void;
  onReport: (reply: Reply) => void;
  /** Mark this reply as the thread's answer, or clear the mark. Omitted for a
   *  viewer who may not. */
  onAcceptAnswer?: (reply: Reply) => void;
  /** Start a reply that quotes this one. */
  onQuote: (reply: Reply) => void;
  inlineDraft: string;
  setInlineDraft: (value: string) => void;
  /** Set on a row of a flattened "continue this thread" column whose parent
   *  is another row of that column. */
  replyingToName?: string;
}

/** One reply plus its subtree, Reddit-style. The reply row (ThreadReplyItem)
 *  draws the rail down from its avatar; `.replyChildren` sits on that rail and
 *  each row inside it draws an elbow into the next avatar, so every level
 *  indents by structure alone. Below the reply, in order: the inline composer
 *  when this reply is the reply target, then the "N hidden replies" row, and
 *  then the children, or past the indent cap the "continue this thread" row
 *  and the flat column it opens. Each of those sits in a ReplyBranchRegion
 *  that stays mounted and animates open and shut, so collapsing, expanding
 *  and continuing all move smoothly. */
export function ThreadReplyNode(props: ThreadReplyNodeProps) {
  const { node, replyingToName, ...sharedProps } = props;
  const {
    index,
    replyKey,
    isLocked,
    likedReplies,
    toggleReplyLike,
    demoMode,
    editingReplyPostId,
    collapsedIds,
    onToggleCollapse,
    activeReplyTargetId,
    onStartReply,
    onQuote,
  } = sharedProps;
  const { t } = useTranslation();
  // Once "Continue this thread" opens the branch, it stays open for good.
  const [isContinued, setIsContinued] = useState(false);

  const hasChildren = node.children.length > 0;
  const isCollapsed = hasChildren && collapsedIds.has(node.reply.id);
  const descendantCount = countDescendants(node);
  const isReplyTarget = activeReplyTargetId === node.reply.id;
  const isShowingComposer = isReplyTarget && !isLocked;
  const isAtIndentCap = node.depth >= MAX_INDENT_DEPTH;
  const hasBranchBelow = isShowingComposer || hasChildren;
  // Live replies nest by BACKEND post id. A reply still waiting for its create
  // response has only a client uuid, which the server rejects as a
  // `parentPostId`, so replying (and quoting, which is a reply) is withheld
  // until the id lands, and everywhere on a closed thread.
  const isReplyWithheld = isLocked || (!demoMode && !node.reply.postId);

  const {
    nodeRef,
    inlineTextareaRef,
    gutterToggleRef,
    branchToggleRef,
    firstFlattenedRowRef,
    toggleBranch,
  } = useReplyBranchFocus({
    isCollapsed,
    isContinued,
    isReplyTarget,
    onToggleCollapse: () => onToggleCollapse(node.reply.id),
  });

  // One row under this reply. An invisible strip over the row's stretch of
  // line makes the whole line clickable: a click collapses this branch.
  const renderBranchNode = (
    branchNode: ReplyNode,
    isLastRow: boolean,
    branchReplyingToName?: string,
    isFirstFlattenedRow = false,
  ) => (
    <div
      key={branchNode.reply.id}
      ref={isFirstFlattenedRow ? firstFlattenedRowRef : undefined}
      tabIndex={isFirstFlattenedRow ? -1 : undefined}
      className={replyBranchRowClassName(isLastRow)}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={styles.branchLineHit}
        // A mouse click never moves focus onto this aria-hidden button.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => toggleBranch("scrollIntoView")}
      />
      <ThreadReplyNode
        {...sharedProps}
        node={branchNode}
        replyingToName={branchReplyingToName}
      />
    </div>
  );

  // Past the cap the rest of the branch is one flat column of childless rows,
  // each naming its parent whenever that parent is not the row above.
  const renderFlattenedRows = () => {
    const flattenedRows = flattenReplyDescendants(node);
    return flattenedRows.map((flattened, rowIndex) =>
      renderBranchNode(
        { ...flattened.node, children: [] },
        rowIndex === flattenedRows.length - 1,
        flattened.parentName ?? undefined,
        rowIndex === 0,
      ),
    );
  };

  return (
    <div
      ref={nodeRef}
      className={[
        styles.replyNode,
        node.depth === 0 ? styles.replyRoot : styles.replyNested,
      ].join(" ")}
    >
      <ThreadReplyItem
        reply={node.reply}
        index={index}
        replyKey={replyKey}
        isLiked={!!likedReplies[replyKey(node.reply)]}
        toggleReplyLike={toggleReplyLike}
        demoMode={demoMode}
        demoOwns={sharedProps.demoOwns}
        isEditing={
          editingReplyPostId === (node.reply.postId ?? replyKey(node.reply))
        }
        onStartEdit={sharedProps.onStartEdit}
        onCancelEdit={sharedProps.onCancelEdit}
        onSaveEdit={sharedProps.onSaveEdit}
        onDelete={sharedProps.onDelete}
        onRestore={sharedProps.onRestore}
        onHistory={sharedProps.onHistory}
        onReply={isReplyWithheld ? undefined : onStartReply}
        onReport={sharedProps.onReport}
        onAcceptAnswer={sharedProps.onAcceptAnswer}
        onQuote={isReplyWithheld ? undefined : onQuote}
        hasBranchBelow={hasBranchBelow}
        collapse={
          hasChildren
            ? {
                isCollapsed,
                descendantCount,
                onToggle: () => toggleBranch("branchToggle"),
                onRailToggle: () =>
                  toggleBranch(isCollapsed ? "gutterToggle" : "scrollIntoView"),
              }
            : undefined
        }
        collapseToggleRef={gutterToggleRef}
        replyingToName={replyingToName}
      />

      {hasBranchBelow && (
        <div className={styles.replyChildren}>
          {isShowingComposer && (
            <InlineReplyComposer
              isLastRow={!hasChildren}
              parentReply={node.reply}
              textareaRef={inlineTextareaRef}
              inlineDraft={sharedProps.inlineDraft}
              setInlineDraft={sharedProps.setInlineDraft}
              onPostReply={sharedProps.onPostReply}
              onCancelReply={sharedProps.onCancelReply}
            />
          )}
          {hasChildren && (
            <>
              <ReplyBranchToggleRow
                isOpen={isCollapsed}
                isLastRow={isCollapsed}
                variant="hidden"
                buttonRef={branchToggleRef}
                label={t("forum:replies.hiddenCount", {
                  count: descendantCount,
                })}
                onClick={() => toggleBranch("gutterToggle")}
              />
              {isAtIndentCap ? (
                <>
                  <ReplyBranchToggleRow
                    isOpen={!isCollapsed && !isContinued}
                    isLastRow={!isContinued}
                    variant="continue"
                    label={t("forum:replies.continueThread", {
                      count: descendantCount,
                    })}
                    onClick={() => setIsContinued(true)}
                  />
                  {isContinued && (
                    <ReplyBranchRegion
                      isOpen={!isCollapsed}
                      shouldAnimateOnMount
                    >
                      {renderFlattenedRows()}
                    </ReplyBranchRegion>
                  )}
                </>
              ) : (
                <ReplyBranchRegion isOpen={!isCollapsed}>
                  {node.children.map((child, childIndex) =>
                    renderBranchNode(
                      child,
                      childIndex === node.children.length - 1,
                    ),
                  )}
                </ReplyBranchRegion>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** The inline reply composer as the first branch row under the reply it
 *  answers, so the thread line's elbow runs straight into it. */
function InlineReplyComposer({
  isLastRow,
  parentReply,
  textareaRef,
  inlineDraft,
  setInlineDraft,
  onPostReply,
  onCancelReply,
}: {
  isLastRow: boolean;
  parentReply: Reply;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  inlineDraft: string;
  setInlineDraft: (value: string) => void;
  onPostReply: (body: string, image?: StagedPostImage) => void;
  onCancelReply: () => void;
}) {
  const { t } = useTranslation();
  // Which thread this reply belongs to, read straight from the route so it
  // never has to be threaded down through every recursion level. It scopes
  // the inline composer's draft, so two threads' answers never share a key.
  const { id: threadRouteId } = useParams<{ id: string }>();
  return (
    <div
      className={`${replyBranchRowClassName(isLastRow, styles.replyBranchCompose)} ${styles.inlineCompose}`}
    >
      <ThreadComposer
        authorName={parentReply.name}
        reply={inlineDraft}
        setReply={setInlineDraft}
        onPost={onPostReply}
        textareaRef={textareaRef}
        // PRD-166: the inline composer autosaves like the bottom one, but
        // keyed to (thread, parent post): a mis-tap on another reply's
        // "Reply" no longer throws away half a paragraph, and two answers
        // under two different replies cannot overwrite each other.
        draft={{
          draftId: nestedReplyDraftId(
            threadRouteId ?? "unsaved",
            parentReply.postId ?? parentReply.id,
          ),
          title: t("forum:draft.inlineReplyTitle", {
            name: parentReply.name,
          }),
          href: threadRouteId ? threadPath(threadRouteId) : routes.forum,
        }}
        onCancel={onCancelReply}
      />
    </div>
  );
}
