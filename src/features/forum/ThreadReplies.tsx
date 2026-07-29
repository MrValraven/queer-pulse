import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
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
import { ThreadReplyItem } from "./ThreadReplyItem";
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
  replies,
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
}: {
  loading: boolean;
  replies: Reply[];
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
}) {
  const { t } = useTranslation();
  return (
    <div>
      {loading && <ThreadRepliesSkeleton count={3} />}
      {!loading && replies.length === 0 && (
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
        replies.map((currentReply, replyIndex) => (
          <ThreadReplyItem
            key={replyKey(currentReply)}
            reply={currentReply}
            index={replyIndex}
            replyKey={replyKey}
            isLiked={!!likedReplies[replyKey(currentReply)]}
            toggleReplyLike={toggleReplyLike}
            demoMode={demoMode}
            demoOwns={demoOwns}
            isEditing={
              editingReplyPostId ===
              (currentReply.postId ?? replyKey(currentReply))
            }
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onHistory={onHistory}
          />
        ))}

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
