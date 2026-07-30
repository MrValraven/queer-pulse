import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfile } from "../../app/providers/useProfile";
import { CATS, type Reply, type ReplySortId } from "./forum.data";
import { useThread } from "./api/useForum";
import { useReply } from "./api/useForumMutations";
import { currentUser } from "../members/data/members";
import { buildReplyTree } from "./buildReplyTree";
import { ThreadOpSection } from "./ThreadOpSection";
import { ThreadReplySection } from "./ThreadReplySection";
import { ThreadTopbar } from "./ThreadTopbar";
import { ThreadNotFoundState } from "./ThreadNotFoundState";
import { ThreadPageModals } from "./ThreadPageModals";
import { deriveOpView, useThreadModeration } from "./useThreadModeration";
import { useNestedReplyComposer } from "./useNestedReplyComposer";
import { MentionNamesProvider } from "../../shared/mentions/MentionNames";
import styles from "./ThreadPage.module.css";

export function ThreadPage() {
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // The logged-in member, mode-aware: the real signed-in user in live mode, the
  // mock persona in demo. Used for the optimistic "You" reply so live never
  // borrows the demo persona's avatar/initials.
  const { profile } = useProfile();
  // The route param is the backend slug in live mode, the numeric mock id in
  // demo. Detail source: demo returns the scripted mock, live fetches meta + a
  // cursor page of posts (further pages append via the "Load more" button).
  const { id: routeParam = "" } = useParams();
  const threadQuery = useThread(routeParam);
  // NEVER fall back to the mock registry here — that leaked demo threads into
  // live mode. Live simply has no thread until the fetch resolves (or 404s).
  // `threadData` is the optional pre-guard binding; below the `!threadData`
  // early return it is aliased to a non-optional `thread`.
  const threadData = threadQuery.thread;
  const postReply = useReply(threadData?.slug);
  const loading = demoMode ? simLoading : threadQuery.isLoading;

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [sort, setSort] = useState<ReplySortId>("oldest");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<Reply[]>(
    threadData?.replies ?? [],
  );
  // Per-reply like toggles, keyed by a stable identity.
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  // Nested-replies UI state (collapse + inline reply composer targeting).
  // Keyed on the thread's stable slug — NOT `threadData?.replies` — so a
  // background refetch (which mints a fresh replies array with the same
  // content) doesn't wipe an in-progress inline draft; the state still resets
  // when the user navigates to a genuinely different thread.
  const nestedReplies = useNestedReplyComposer(threadData?.slug);
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

  const replyKey = (replyItem: Reply) => replyItem.id;

  // Every edit/delete/restore/history concern (state + mutations + handlers).
  const moderation = useThreadModeration({
    thread: threadData,
    demoMode,
    setLocalReplies,
    replyKey,
  });

  const toggleReplyLike = (r: Reply) => {
    const key = replyKey(r);
    setLikedReplies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset the local reply list and per-reply likes whenever the thread
  // changes (including once the live fetch resolves and replies first
  // appear). `nestedReplies` resets itself in step (see its own effect).
  useEffect(() => {
    // Resets the reply list when the thread's async fetch resolves or changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalReplies(threadData?.replies ?? []);
    setLikedReplies({});
  }, [threadData?.replies]);

  const catMeta = CATS.find((c) => c.id === threadData?.category);

  const replyTree = useMemo(
    () => buildReplyTree(localReplies, sort),
    [localReplies, sort],
  );

  function addReply(body: string, parentPostId: string | null = null) {
    setLocalReplies((prev) => [
      ...prev,
      {
        // Client-generated id; live mode reconciles against the server's real
        // post id once `postReply` resolves. `parentPostId` nests this reply
        // under an existing post, or null for a top-level thread reply.
        id: crypto.randomUUID(),
        parentPostId,
        avatar: profile.initials,
        background: "var(--plum)",
        color: "var(--cream)",
        name: "You",
        slug: profile.slug,
        photo: profile.photo,
        time: "Just now",
        body: [body],
        reactions: 0,
      },
    ]);
    if (parentPostId != null) nestedReplies.cancelReply();
    else setReply("");
    showToast(t("forum:threadPage.replyPostedToast"), "success");
    // Live mode persists; demo mode no-ops (local reply above is the record).
    postReply.mutate({ body, parentPostId });
  }

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

  return (
    <PageShell>
      <MentionNamesProvider>
        <ThreadTopbar categoryName={catMeta ? t(catMeta.nameKey) : undefined} />

        <section className="wrap">
          <div className={styles.layout}>
            <ThreadOpSection
              thread={thread}
              opView={opView}
              liked={liked}
              setLiked={setLiked}
              bookmarked={bookmarked}
              setBookmarked={setBookmarked}
              moderation={moderation}
            />

            <ThreadReplySection
              sort={sort}
              setSort={setSort}
              count={localReplies.length}
              loading={loading}
              nodes={replyTree}
              replyKey={replyKey}
              likedReplies={likedReplies}
              toggleReplyLike={toggleReplyLike}
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
