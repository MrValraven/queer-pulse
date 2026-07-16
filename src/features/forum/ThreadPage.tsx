import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { CATS, THREADS, type Reply, type ReplySortId } from "./forum.data";
import { useThread } from "./api/useForum";
import { useReply } from "./api/useForumMutations";
import { currentUser } from "../members/data/members";
import { ReportReplyModal } from "./ReportReplyModal";
import { ThreadOpCard } from "./ThreadOpCard";
import { ReplySortBar, ThreadReplies } from "./ThreadReplies";
import { ThreadComposer } from "./ThreadComposer";
import styles from "./ThreadPage.module.css";

export function ThreadPage() {
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { id } = useParams();
  const numericId = Number(id);
  // Detail source: demo returns the scripted mock, live fetches meta + posts.
  const threadQuery = useThread(Number.isFinite(numericId) ? numericId : 0);
  const thread =
    threadQuery.data ?? THREADS.find((t) => String(t.id) === id) ?? THREADS[0]!;
  const postReply = useReply(thread.id);
  const loading = demoMode ? simLoading : threadQuery.isLoading;

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [sort, setSort] = useState<ReplySortId>("oldest");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<Reply[]>(thread.replies);
  // Per-reply like toggles, keyed by a stable identity (replies have no id).
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  const [reportingAuthor, setReportingAuthor] = useState<string | null>(null);
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

  const replyKey = (r: Reply) => `${r.name}|${r.time}|${r.body[0] ?? ""}`;

  const toggleReplyLike = (r: Reply) => {
    const key = replyKey(r);
    setLikedReplies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset the local reply list and per-reply likes whenever the thread changes.
  useEffect(() => {
    setLocalReplies(thread.replies);
    setLikedReplies({});
  }, [thread.replies]);

  const catMeta = CATS.find((c) => c.id === thread.cat);

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
        av: currentUser.initials,
        bg: "var(--plum)",
        color: "var(--cream)",
        name: "You",
        slug: currentUser.slug,
        photo: currentUser.photo,
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
            liked={liked}
            setLiked={setLiked}
            bookmarked={bookmarked}
            setBookmarked={setBookmarked}
            onReport={() => setReportingAuthor(thread.author.n)}
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
    </PageShell>
  );
}
