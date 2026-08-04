import { PageShell } from "../../shared/components/layout";
import { currentUser } from "../members/data/members";
import { ThreadOpSection } from "./ThreadOpSection";
import { ThreadReplySection } from "./ThreadReplySection";
import { ThreadTopbar } from "./ThreadTopbar";
import { ThreadNotFoundState } from "./ThreadNotFoundState";
import { ThreadPageModals } from "./ThreadPageModals";
import { deriveOpView } from "./useThreadModeration";
import { useThreadPageState } from "./useThreadPageState";
import { MentionNamesProvider } from "../../shared/mentions/MentionNames";
import styles from "./ThreadPage.module.css";

export function ThreadPage() {
  const {
    t,
    demoMode,
    threadData,
    loading,
    threadQuery,
    vote,
    bookmarked,
    setBookmarked,
    sort,
    setSort,
    reply,
    setReply,
    demoOpVoted,
    setDemoOpVoted,
    localReplies,
    nestedReplies,
    replyBoxRef,
    replyKey,
    moderation,
    voteReply,
    catMeta,
    replyTree,
    likedReplies,
    addReply,
  } = useThreadPageState();

  // Live mode has no thread until the fetch resolves — skeleton, then a real
  // "not found" state. Demo always has a thread, so this branch is live-only.
  if (!threadData) return <ThreadNotFoundState loading={loading} />;

  // Past the guard the thread is resolved — a non-optional alias so the OP
  // permission logic below can use it without optional-chaining.
  const thread = threadData;

  // In demo there are no server flags; ownership is the demo persona. In live,
  // permission flags come only from the DTO (already on the view-model).
  const demoOwns = (person: { slug?: string; name?: string }) =>
    demoMode && (person.slug === currentUser.slug || person.name === "You");

  const ownsOp = demoOwns({ slug: thread.author.slug, name: thread.author.name });
  const opView = deriveOpView(thread, demoMode, ownsOp, moderation.opOverride);

  // DEMO overlays the local OP-vote toggle onto the mock thread so the button's
  // pressed state + count reflect the tap; LIVE reads the thread straight through
  // (its `myVote`/`upvotes` are already patched in place by the vote mutation).
  const opThread = demoMode
    ? {
        ...thread,
        myVote: demoOpVoted ? 1 : 0,
        upvotes: thread.upvotes + (demoOpVoted ? 1 : 0),
      }
    : thread;

  return (
    <PageShell>
      <MentionNamesProvider>
        <ThreadTopbar
          categoryName={catMeta ? t(catMeta.nameKey) : undefined}
          thread={thread}
        />

        <section className="wrap">
          <div className={styles.layout}>
            <ThreadOpSection
              thread={opThread}
              opView={opView}
              onVote={() => {
                // DEMO: flip the local overlay (no cache, no network). LIVE:
                // cast/retract the real vote on the OP's backend post.
                if (demoMode) {
                  setDemoOpVoted((voted) => !voted);
                  return;
                }
                if (thread.opPostId)
                  vote(thread.opPostId, thread.myVote ? 0 : 1);
              }}
              bookmarked={bookmarked}
              setBookmarked={setBookmarked}
              moderation={moderation}
            />

            <ThreadReplySection
              sort={sort}
              setSort={setSort}
              count={localReplies.length}
              loading={loading}
              isLocked={!!thread.isLocked}
              nodes={replyTree}
              replyKey={replyKey}
              likedReplies={likedReplies}
              toggleReplyLike={voteReply}
              hasNextPage={threadQuery.hasNextPage}
              fetchNextPage={threadQuery.fetchNextPage}
              isFetchingNextPage={threadQuery.isFetchingNextPage}
              demoMode={demoMode}
              demoOwns={demoOwns}
              moderation={moderation}
              nestedReplies={nestedReplies}
              authorName={thread.author.name}
              reply={reply}
              setReply={setReply}
              onPost={addReply}
              textareaRef={replyBoxRef}
            />
          </div>
        </section>

        <ThreadPageModals
          reportingAuthor={moderation.reportingAuthor}
          threadId={String(thread.id)}
          onCloseReport={() => moderation.setReportingAuthor(null)}
          editingOp={moderation.editingOp}
          opTitle={opView.opTitle}
          editingOpInitialBody={moderation.editingOpInitialBody}
          editBusy={moderation.editBusy}
          onSaveOp={moderation.saveOpEdit}
          onCloseOp={() => moderation.setEditingOp(false)}
          confirmDelete={moderation.confirmDelete}
          deleteBusy={moderation.deleteBusy}
          onConfirmDelete={() =>
            moderation.confirmDelete &&
            moderation.doDeletePost(
              moderation.confirmDelete.postId,
              moderation.confirmDelete.isOp,
            )
          }
          onCloseDelete={() => moderation.setConfirmDelete(null)}
          historyPostId={moderation.historyPostId}
          onCloseHistory={() => moderation.setHistoryPostId(null)}
        />
      </MentionNamesProvider>
    </PageShell>
  );
}
