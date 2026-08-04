import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply } from "./forum.data";
import { countDescendants, type ReplyNode } from "./buildReplyTree";
import { ThreadReplyItem } from "./ThreadReplyItem";
import { ThreadComposer } from "./ThreadComposer";
import styles from "./ThreadPage.module.css";

/** Past this depth the visual indent stops nudging further right — deep
 *  branches stay legible instead of running off the edge — and a "continue
 *  this thread" branch-off takes over from further recursion. */
const MAX_INDENT_DEPTH = 4;
/** Left indent per depth level, in rem (clamped at MAX_INDENT_DEPTH). */
const INDENT_STEP_REM = 1.25;

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
  demoOwns: (person: { slug?: string; name?: string }) => boolean;
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
  onPostReply: (body: string) => void;
  inlineDraft: string;
  setInlineDraft: (value: string) => void;
}

/** One reply plus its subtree, Reddit-style. Renders the existing
 *  ThreadReplyItem unchanged (forwarding every prop it already takes, plus
 *  the onReply/collapse pair it grew for this feature), then recurses into
 *  `node.children` — indenting each level, clamped at MAX_INDENT_DEPTH so
 *  deep threads never crowd off-screen. A collapsed node hides its subtree
 *  behind a "N hidden replies" toggle; a node stuck at the indent cap hides
 *  its subtree behind a "continue this thread" branch-off until clicked. */
export function ThreadReplyNode({
  node,
  index,
  replyKey,
  isLocked,
  likedReplies,
  toggleReplyLike,
  demoMode,
  demoOwns,
  editingReplyPostId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
  onHistory,
  collapsedIds,
  onToggleCollapse,
  activeReplyTargetId,
  onStartReply,
  onCancelReply,
  onPostReply,
  inlineDraft,
  setInlineDraft,
}: ThreadReplyNodeProps) {
  const { t } = useTranslation();
  // Once a branch-off past the indent cap is opened, it stays open for the
  // rest of this node's lifetime (no reason to re-collapse it automatically).
  const [continued, setContinued] = useState(false);
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);

  const indent = Math.min(node.depth, MAX_INDENT_DEPTH);
  const hasChildren = node.children.length > 0;
  const isCollapsed = hasChildren && collapsedIds.has(node.reply.id);
  const descendantCount = countDescendants(node);
  const isReplyTarget = activeReplyTargetId === node.reply.id;
  const atIndentCap = node.depth >= MAX_INDENT_DEPTH;
  const showChildren = hasChildren && !isCollapsed && (!atIndentCap || continued);

  // Move focus into the inline composer when it opens for THIS node — not on
  // every render, only the transition into being the active reply target.
  useEffect(() => {
    if (isReplyTarget) {
      inlineTextareaRef.current?.focus();
    }
  }, [isReplyTarget]);

  return (
    <div
      className={[styles.replyNode, node.depth > 0 && styles.threadLine]
        .filter(Boolean)
        .join(" ")}
      style={{ marginLeft: `${indent * INDENT_STEP_REM}rem` }}
    >
      <ThreadReplyItem
        reply={node.reply}
        index={index}
        replyKey={replyKey}
        isLiked={!!likedReplies[replyKey(node.reply)]}
        toggleReplyLike={toggleReplyLike}
        demoMode={demoMode}
        demoOwns={demoOwns}
        isEditing={
          editingReplyPostId === (node.reply.postId ?? replyKey(node.reply))
        }
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        onHistory={onHistory}
        onReply={isLocked ? undefined : onStartReply}
        collapse={
          hasChildren
            ? {
                collapsed: isCollapsed,
                count: descendantCount,
                onToggle: () => onToggleCollapse(node.reply.id),
              }
            : undefined
        }
      />

      {isReplyTarget && !isLocked && (
        <div className={styles.inlineCompose}>
          <ThreadComposer
            authorName={node.reply.name}
            reply={inlineDraft}
            setReply={setInlineDraft}
            onPost={onPostReply}
            textareaRef={inlineTextareaRef}
          />
          <Button
            variant="ghost"
            type="button"
            className={styles.inlineCancel}
            onClick={onCancelReply}
          >
            {t("forum:replyEdit.cancel")}
          </Button>
        </div>
      )}

      {hasChildren && isCollapsed && (
        <ReplyBranchToggle
          variant="hidden"
          label={t("forum:replies.hiddenCount", { count: descendantCount })}
          onClick={() => onToggleCollapse(node.reply.id)}
        />
      )}

      {hasChildren && !isCollapsed && atIndentCap && !continued && (
        <ReplyBranchToggle
          variant="continue"
          label={t("forum:replies.continueThread", { count: descendantCount })}
          onClick={() => setContinued(true)}
        />
      )}

      {showChildren &&
        node.children.map((child) => (
          <ThreadReplyNode
            key={child.reply.id}
            node={child}
            index={index}
            replyKey={replyKey}
            isLocked={isLocked}
            likedReplies={likedReplies}
            toggleReplyLike={toggleReplyLike}
            demoMode={demoMode}
            demoOwns={demoOwns}
            editingReplyPostId={editingReplyPostId}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onHistory={onHistory}
            collapsedIds={collapsedIds}
            onToggleCollapse={onToggleCollapse}
            activeReplyTargetId={activeReplyTargetId}
            onStartReply={onStartReply}
            onCancelReply={onCancelReply}
            onPostReply={onPostReply}
            inlineDraft={inlineDraft}
            setInlineDraft={setInlineDraft}
          />
        ))}
    </div>
  );
}

/** The full-width ghost bar standing in for a hidden/deferred subtree — either
 *  "N hidden replies" (collapsed) or "Continue this thread → (N)" (indent
 *  cap reached). Kept tiny and colocated rather than a separate file. */
function ReplyBranchToggle({
  variant,
  label,
  onClick,
}: {
  variant: "hidden" | "continue";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={variant === "continue" ? styles.continueThread : styles.branchToggle}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
