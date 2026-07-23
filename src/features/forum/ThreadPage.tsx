import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfile } from "../../app/providers/ProfileProvider";
import { routes } from "../../app/routeMap";
import { CATS, type Reply, type ReplySortId } from "./forum.data";
import { useThread } from "./api/useForum";
import {
  useReply,
  useEditPost,
  useDeletePost,
  useRestorePost,
  useEditThreadTitle,
} from "./api/useForumMutations";
import { currentUser } from "../members/data/members";
import { ReportReplyModal } from "./ReportReplyModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { EditOpModal } from "./EditOpModal";
import { ForumEditHistoryModal } from "./ForumEditHistoryModal";
import { ThreadOpCard } from "./ThreadOpCard";
import { ReplySortBar, ThreadReplies } from "./ThreadReplies";
import { ThreadRepliesSkeleton } from "./ThreadRepliesSkeleton";
import { ThreadComposer } from "./ThreadComposer";
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
  // The four id-keyed mutations need a numeric thread id even while `thread`
  // hasn't resolved yet (live mode, before the fetch settles) — mirroring the
  // `0` placeholder already used elsewhere before a real id is known.
  const editPost = useEditPost();
  const deletePost = useDeletePost();
  const restorePost = useRestorePost();
  const editTitle = useEditThreadTitle(threadData?.id ?? 0);
  const loading = demoMode ? simLoading : threadQuery.isLoading;

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [sort, setSort] = useState<ReplySortId>("oldest");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<Reply[]>(
    threadData?.replies ?? [],
  );
  // Per-reply like toggles, keyed by a stable identity (replies have no id).
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  const [reportingAuthor, setReportingAuthor] = useState<string | null>(null);
  const [editingReplyPostId, setEditingReplyPostId] = useState<string | null>(
    null,
  );
  const [editingOp, setEditingOp] = useState(false);
  // Snapshot of the OP body exactly as EditOpModal was initialized with, so
  // `saveOpEdit` can tell a genuine body change from a title-only edit even if
  // `thread.body` itself changes (e.g. a background refetch) while the modal
  // is open — comparing against a live-recomputed `thread.body.join("\n")`
  // would misfire in that window.
  const [editingOpInitialBody, setEditingOpInitialBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{
    postId: string;
    isOp: boolean;
  } | null>(null);
  const [historyPostId, setHistoryPostId] = useState<string | null>(null);
  // Demo-only local overrides for the OP card (live refetches after mutation).
  const [opOverride, setOpOverride] = useState<{
    title?: string;
    body?: string[];
    deleted?: boolean;
    editedAt?: string | null;
  }>({});
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

  const replyKey = (r: Reply) => `${r.name}|${r.time}|${r.body[0] ?? ""}`;

  const toggleReplyLike = (r: Reply) => {
    const key = replyKey(r);
    setLikedReplies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset the local reply list and per-reply likes whenever the thread changes
  // (including once the live fetch resolves and replies first appear).
  useEffect(() => {
    setLocalReplies(threadData?.replies ?? []);
    setLikedReplies({});
  }, [threadData?.replies]);

  const catMeta = CATS.find((c) => c.id === threadData?.cat);

  const replies = useMemo(() => {
    if (sort === "newest") return [...localReplies].reverse();
    if (sort === "mostHelpful")
      return [...localReplies].sort(
        (a, b) =>
          Number(b.helpful ?? 0) - Number(a.helpful ?? 0) ||
          b.reactions - a.reactions,
      );
    return localReplies;
  }, [localReplies, sort]);

  function addReply(body: string) {
    setLocalReplies((prev) => [
      ...prev,
      {
        av: profile.initials,
        bg: "var(--plum)",
        color: "var(--cream)",
        name: "You",
        slug: profile.slug,
        photo: profile.photo,
        time: "Just now",
        body: [body],
        reactions: 0,
      },
    ]);
    setReply("");
    showToast(t("forum:threadPage.replyPostedToast"), "success");
    // Live mode persists; demo mode no-ops (local reply above is the record).
    postReply.mutate(body);
  }

  // Live mode has no thread until the fetch resolves — show a skeleton while it
  // loads, then a real "not found" state if the slug resolves to nothing. Demo
  // always has a thread here, so this branch is live-only.
  if (!threadData) {
    return (
      <PageShell>
        <section className="wrap">
          <div className={styles.layout}>
            {loading ? (
              <ThreadRepliesSkeleton count={4} />
            ) : (
              <EmptyState
                icon={<FiMessageSquare />}
                title={t("forum:threadPage.notFound.title")}
                description={t("forum:threadPage.notFound.description")}
                action={{
                  label: t("forum:threadPage.notFound.backCta"),
                  to: routes.forum,
                }}
              />
            )}
          </div>
        </section>
      </PageShell>
    );
  }

  // Past the guard the thread is resolved — a non-optional alias so the OP
  // permission logic and the nested edit/delete/restore handlers below can use
  // it without the optional-chaining the pre-guard hooks needed.
  const thread = threadData;

  // In demo there are no server flags; ownership is the demo persona. In live,
  // permission flags come only from the DTO (already on the view-model).
  const demoOwns = (person: { slug?: string; name?: string }) =>
    demoMode && (person.slug === currentUser.slug || person.name === "You");

  const opAuthorIdentity = { slug: thread.author.slug, name: thread.author.n };
  const opDeleted = demoMode ? !!opOverride.deleted : !!thread.deleted;
  const opCanEdit = demoMode
    ? demoOwns(opAuthorIdentity) && !opDeleted
    : !!thread.canEdit;
  const opCanDelete = demoMode
    ? demoOwns(opAuthorIdentity) && !opDeleted
    : !!thread.canDelete;
  const opCanRestore = demoMode
    ? demoOwns(opAuthorIdentity) && opDeleted
    : !!thread.canRestore;
  const opCanViewHistory = demoMode ? false : !!thread.canViewHistory;
  const opTitle = demoMode ? (opOverride.title ?? thread.title) : thread.title;
  const opBody = demoMode ? (opOverride.body ?? thread.body) : thread.body;
  const opEditedAt = demoMode
    ? (opOverride.editedAt ?? thread.editedAt ?? null)
    : (thread.editedAt ?? null);

  function saveReplyEdit(postId: string, body: string) {
    setLocalReplies((prev) =>
      prev.map((currentReply) =>
        currentReply.postId === postId ||
        (demoMode && replyKey(currentReply) === postId)
          ? { ...currentReply, body: [body], editedAt: new Date().toISOString() }
          : currentReply,
      ),
    );
    setEditingReplyPostId(null);
    if (!demoMode)
      editPost.mutate(
        { postId, body },
        { onError: () => showToast(t("forum:toast.error"), "error") },
      );
    showToast(t("forum:toast.editSaved"), "success");
  }

  function doDeletePost(postId: string, isOp: boolean) {
    const onMutateError = () => showToast(t("forum:toast.error"), "error");
    if (isOp) {
      if (demoMode) setOpOverride((prev) => ({ ...prev, deleted: true }));
      else deletePost.mutate({ postId }, { onError: onMutateError });
    } else {
      setLocalReplies((prev) =>
        prev.map((currentReply) =>
          currentReply.postId === postId
            ? { ...currentReply, deleted: true }
            : currentReply,
        ),
      );
      if (!demoMode) deletePost.mutate({ postId }, { onError: onMutateError });
    }
    setConfirmDelete(null);
    showToast(t("forum:toast.deleted"), "success");
  }

  function doRestorePost(postId: string, isOp: boolean) {
    const onMutateError = () => showToast(t("forum:toast.error"), "error");
    if (isOp) {
      if (demoMode) setOpOverride((prev) => ({ ...prev, deleted: false }));
      else restorePost.mutate({ postId }, { onError: onMutateError });
    } else {
      setLocalReplies((prev) =>
        prev.map((currentReply) =>
          currentReply.postId === postId
            ? { ...currentReply, deleted: false }
            : currentReply,
        ),
      );
      if (!demoMode)
        restorePost.mutate({ postId }, { onError: onMutateError });
    }
    showToast(t("forum:toast.restored"), "success");
  }

  function saveOpEdit(next: { title: string; body: string }) {
    // `thread` is guaranteed defined by the early-return above, but narrowing
    // doesn't cross into a nested function's body — re-assert it here.
    if (!thread) return;
    if (demoMode) {
      setOpOverride((prev) => ({
        ...prev,
        title: next.title,
        body: next.body
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        editedAt: new Date().toISOString(),
      }));
    } else {
      const onMutateError = () => showToast(t("forum:toast.error"), "error");
      if (next.title !== thread.title)
        editTitle.mutate({ title: next.title }, { onError: onMutateError });
      // Compare against the snapshot EditOpModal was opened with, not a fresh
      // `thread.body.join("\n")` — the latter can drift from a background
      // refetch while the modal is open, spuriously firing a body edit when
      // the member only changed the title. See `editingOpInitialBody` above.
      if (thread.opPostId && next.body !== editingOpInitialBody)
        editPost.mutate(
          { postId: thread.opPostId, body: next.body },
          { onError: onMutateError },
        );
    }
    setEditingOp(false);
    showToast(t("forum:toast.editSaved"), "success");
  }

  return (
    <PageShell>
      <section className={styles.topbar}>
        <div className="wrap">
          <div className={styles.topbarInner}>
            <Link to={routes.forum} className={styles.back}>
              <svg
                width={14}
                height={14}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="10,4 6,8 10,12" />
              </svg>
              {t("forum:threadPage.breadcrumbForum")}
            </Link>
            <span className={styles.sep} />
            <span className={styles.topCat}>
              {catMeta && t(catMeta.nameKey)}
            </span>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className={styles.layout}>
          <ThreadOpCard
            thread={thread}
            title={opTitle}
            body={opBody}
            editedAt={opEditedAt}
            deleted={opDeleted}
            liked={liked}
            setLiked={setLiked}
            bookmarked={bookmarked}
            setBookmarked={setBookmarked}
            onReport={() => setReportingAuthor(thread.author.n)}
            canEdit={opCanEdit}
            canDelete={opCanDelete}
            canRestore={opCanRestore}
            canViewHistory={opCanViewHistory}
            onEdit={() => {
              setEditingOpInitialBody(opBody.join("\n"));
              setEditingOp(true);
            }}
            onDelete={() =>
              thread.opPostId
                ? setConfirmDelete({ postId: thread.opPostId, isOp: true })
                : setOpOverride((prev) => ({ ...prev, deleted: true }))
            }
            onRestore={() => doRestorePost(thread.opPostId ?? "", true)}
            onHistory={() =>
              thread.opPostId && setHistoryPostId(thread.opPostId)
            }
          />

          <ReplySortBar
            count={localReplies.length}
            sort={sort}
            setSort={setSort}
          />

          <ThreadReplies
            loading={loading}
            replies={replies}
            replyKey={replyKey}
            likedReplies={likedReplies}
            toggleReplyLike={toggleReplyLike}
            onFocusComposer={() => replyBoxRef.current?.focus()}
            hasNextPage={threadQuery.hasNextPage}
            fetchNextPage={threadQuery.fetchNextPage}
            isFetchingNextPage={threadQuery.isFetchingNextPage}
            demoMode={demoMode}
            demoOwns={demoOwns}
            editingReplyPostId={editingReplyPostId}
            onStartEdit={(replyItem) =>
              setEditingReplyPostId(replyItem.postId ?? replyKey(replyItem))
            }
            onCancelEdit={() => setEditingReplyPostId(null)}
            onSaveEdit={saveReplyEdit}
            onDelete={(replyItem) =>
              replyItem.postId
                ? setConfirmDelete({ postId: replyItem.postId, isOp: false })
                : setLocalReplies((prev) =>
                    prev.map((currentReply) =>
                      replyKey(currentReply) === replyKey(replyItem)
                        ? { ...currentReply, deleted: true }
                        : currentReply,
                    ),
                  )
            }
            onRestore={(replyItem) =>
              replyItem.postId && doRestorePost(replyItem.postId, false)
            }
            onHistory={(replyItem) =>
              replyItem.postId && setHistoryPostId(replyItem.postId)
            }
          />

          <ThreadComposer
            authorName={thread.author.n}
            reply={reply}
            setReply={setReply}
            onPost={addReply}
            textareaRef={replyBoxRef}
          />
        </div>
      </section>

      {reportingAuthor && (
        <ReportReplyModal
          authorName={reportingAuthor}
          subjectId={String(thread.id)}
          onClose={() => setReportingAuthor(null)}
        />
      )}
      {editingOp && (
        <EditOpModal
          initialTitle={opTitle}
          initialBody={editingOpInitialBody}
          busy={editPost.isPending || editTitle.isPending}
          onSave={saveOpEdit}
          onClose={() => setEditingOp(false)}
        />
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          busy={deletePost.isPending}
          onConfirm={() =>
            doDeletePost(confirmDelete.postId, confirmDelete.isOp)
          }
          onClose={() => setConfirmDelete(null)}
        />
      )}
      {historyPostId && (
        <ForumEditHistoryModal
          postId={historyPostId}
          onClose={() => setHistoryPostId(null)}
        />
      )}
    </PageShell>
  );
}
