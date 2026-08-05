import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useIncrementalList } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  MOD_ROLE_KEY,
  REPLY_SORTS,
  type Reply,
  type ReplySortId,
} from "./forum.data";
import { memberPath } from "./forumAuthor.helpers";
import { memberName } from "../members/data/members";
import { ThreadRepliesSkeleton } from "./ThreadRepliesSkeleton";
import { ThreadReplyNode } from "./ThreadReplyNode";
import { type ReplyNode } from "./buildReplyTree";
import styles from "./ThreadPage.module.css";

/** Names the moderator who published an official QueerPulse post, linking to
 * their member profile — so the platform voice stays accountable to a person. */
export function ModeratorByline({ mod }: { mod?: string }) {
  const { t } = useTranslation();
  if (!mod) return null;
  const roleKey = MOD_ROLE_KEY[mod];
  const name = memberName(mod);
  return (
    <div className={styles.modBy}>
      <Translation
        i18nKey={roleKey ? "forum:byline.withRole" : "forum:byline.noRole"}
        components={{
          name: <Link to={memberPath(mod)} className={styles.modByLink} />,
        }}
        values={roleKey ? { name, role: t(roleKey) } : { name }}
      />
    </div>
  );
}

export function ReplySortBar({
  count,
  sort,
  setSort,
}: {
  count: number;
  sort: ReplySortId;
  setSort: (s: ReplySortId) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.replyBar}>
      <span className={styles.replyCount}>
        {t("forum:repliesCount", { count, formatted: fmt.number(count) })}
      </span>
      <div className={styles.replySort}>
        {REPLY_SORTS.map((s) => (
          <button
            type="button"
            key={s.id}
            className={[styles.sortBtn, sort === s.id && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort(s.id)}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThreadReplies({
  loading,
  isLocked,
  nodes,
  replyKey,
  likedReplies,
  toggleReplyLike,
  onFocusComposer,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
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
  onReport,
  inlineDraft,
  setInlineDraft,
}: {
  loading: boolean;
  /** When true, replies are closed: no reply affordance or inline composer
   *  renders on any node in the tree. */
  isLocked: boolean;
  /** Reply tree, already sorted (see buildReplyTree) — top-level nodes only;
   *  each node recurses into its own children. */
  nodes: ReplyNode[];
  replyKey: (r: Reply) => string;
  likedReplies: Record<string, boolean>;
  toggleReplyLike: (r: Reply) => void;
  onFocusComposer: () => void;
  /** Live mode only — demo passes `false`, so no "Load more" ever renders. */
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
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
  /** Report a specific reply — opens the report modal targeting its `postId`. */
  onReport: (reply: Reply) => void;
  inlineDraft: string;
  setInlineDraft: (value: string) => void;
}) {
  const { t } = useTranslation();

  // `nodes` accumulates every page fetched so far (each "Load more" click
  // appends a server page and every reply loaded stays mounted, expanded, and
  // nested — never re-collapsed by default). A long, well-commented thread can
  // realistically reach the high hundreds of mounted reply subtrees. Window the
  // TOP-LEVEL list the same way MemberDirectoryFilterPage windows its card
  // grid: a capped initial slice grown via an IntersectionObserver sentinel,
  // independent of the server-side "Load more" pagination below. This caps how
  // many top-level trees mount at once; it does not cap a single expanded
  // node's own descendant count, which the existing collapse/"continue this
  // thread" affordances already bound (see ThreadReplyNode).
  const {
    visible: nodesWindowed,
    sentinelRef,
    hasMore: hasMoreWindowed,
  } = useIncrementalList(nodes, { initial: 20, step: 20 });

  return (
    <div>
      {loading && <ThreadRepliesSkeleton count={3} />}
      {!loading && nodes.length === 0 && (
        <EmptyState
          compact
          icon={<FiMessageSquare />}
          title={t("forum:replies.emptyTitle")}
          description={t("forum:replies.emptyDescription")}
          action={{
            label: t("forum:replies.emptyAction"),
            onClick: onFocusComposer,
          }}
        />
      )}
      {!loading &&
        nodesWindowed.map((topLevelNode, topLevelIndex) => (
          <ThreadReplyNode
            key={topLevelNode.reply.id}
            node={topLevelNode}
            index={topLevelIndex}
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
            onReport={onReport}
            inlineDraft={inlineDraft}
            setInlineDraft={setInlineDraft}
          />
        ))}

      {!loading && hasMoreWindowed && (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      )}

      {!loading && hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            {isFetchingNextPage
              ? t("forum:replies.loadingMore")
              : t("forum:replies.loadMoreCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
