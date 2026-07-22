import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { SELF_AUTHOR, selfAuthorFromProfile, type Thread } from "./forum.data";
import { useThreads } from "./api/useForum";
import { useCreateThread } from "./api/useForumMutations";
import { ComposeThreadModal, type NewThreadInput } from "./ComposeThreadModal";
import { FirstPostPrompt } from "./FirstPostPrompt";
import { ForumSidebar } from "./ForumSidebar";
import { ForumThreadList } from "./ForumThreadList";
import styles from "./ForumPage.module.css";

const PROMPT_DISMISSED_KEY = "qp_forum_prompt_dismissed";

export function ForumPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const simLoading = useSimulatedLoad();
  const [cat, setCat] = useState("all");
  // Thread source: demo returns the full mock as one terminal page, live pages
  // through GET /forum/threads via the "Load more" button below the list.
  const threadsQuery = useThreads(cat);
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = threadsQuery;
  const createThread = useCreateThread();
  const loading = demoMode ? simLoading : threadsQuery.isLoading;
  const [sort, setSort] = useState<"top" | "new">("top");
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [composing, setComposing] = useState(false);
  const [composeSeed, setComposeSeed] = useState("");
  const [extraThreads, setExtraThreads] = useState<Thread[]>([]);
  const [promptDismissed, setPromptDismissed] = useState(
    () =>
      typeof localStorage !== "undefined" &&
      localStorage.getItem(PROMPT_DISMISSED_KEY) === "1",
  );

  // Show the first-post invitation only to members who haven't posted this
  // session and haven't waved it away before (dismissal persists across reloads).
  const showFirstPostPrompt = !promptDismissed && extraThreads.length === 0;

  function dismissPrompt() {
    setPromptDismissed(true);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Private mode / storage disabled — session-only dismissal is fine.
    }
  }

  function openCompose(seed = "") {
    setComposeSeed(seed);
    setComposing(true);
  }

  const allThreads = useMemo(() => {
    // Once the server-persisted copy of a just-posted thread comes back in the
    // refetched list, drop the local optimistic copy so the post doesn't render
    // twice (matched on category + title). Demo never refetches, so its
    // optimistic posts are kept as the record.
    const serverKeys = new Set(
      threadsQuery.threads.map((thread) => `${thread.cat}::${thread.title}`),
    );
    const optimistic = extraThreads.filter(
      (thread) => !serverKeys.has(`${thread.cat}::${thread.title}`),
    );
    return [...optimistic, ...threadsQuery.threads];
  }, [extraThreads, threadsQuery.threads]);

  // Sidebar post counts derived from the real threads (members' posts), so they
  // stay truthful and update live when a member publishes a new one.
  const counts = useMemo(() => {
    const by: Record<string, number> = {};
    for (const t of allThreads) by[t.cat] = (by[t.cat] ?? 0) + 1;
    return by;
  }, [allThreads]);

  const threads = useMemo(() => {
    const filtered = allThreads.filter((t) => cat === "all" || t.cat === cat);
    if (sort === "new") return [...filtered].sort((a, b) => b.id - a.id);
    return [...filtered].sort(
      (a, b) =>
        (b.pinned ? 1000 : 0) + b.upvotes - ((a.pinned ? 1000 : 0) + a.upvotes),
    );
  }, [allThreads, cat, sort]);

  function publishThread({ title, body, cat: postCat }: NewThreadInput) {
    const id = Date.now();
    const excerpt = body.length > 160 ? `${body.slice(0, 157)}…` : body;
    // Live posts are authored by the REAL session user — never the mock
    // `SELF_AUTHOR` ("Tiago Costa" demo persona), which would otherwise leak into
    // production. Demo keeps the scripted "You" persona.
    const author =
      demoMode || !user ? SELF_AUTHOR : selfAuthorFromProfile(user.profile);
    setExtraThreads((prev) => [
      {
        id,
        cat: postCat,
        title,
        excerpt,
        author,
        posted: "just now",
        views: 1,
        upvotes: 1,
        comments: 0,
        tags: [],
        body: body
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
        replies: [],
      },
      ...prev,
    ]);
    // Surface the new post regardless of current filter/sort.
    setCat("all");
    setSort("new");
    // Once they've posted, the first-post invitation has done its job — for good.
    dismissPrompt();
    // Live mode persists; demo mode no-ops (the local thread above is the record).
    createThread.mutate({ title, body, category: postCat });
  }

  function toggleVote(id: number) {
    setVoted((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroRow}>
            <div>
              <div className={styles.cat}>{t("forum:hero.eyebrow")}</div>
              <h1>
                <Translation
                  i18nKey="forum:hero.title"
                  components={{ em: <em /> }}
                />
              </h1>
              <p>
                {t("forum:hero.lead")}{" "}
                <Link to={routes.communities} className={styles.heroLink}>
                  {t("forum:hero.findCommunitiesCta")}
                </Link>
              </p>
            </div>
            <Button className={styles.newBtn} onClick={() => openCompose()}>
              {t("forum:newPostCta")}
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <ForumSidebar
              cat={cat}
              setCat={setCat}
              counts={counts}
              totalCount={allThreads.length}
            />
            <div>
              {showFirstPostPrompt && (
                <FadeIn>
                  <FirstPostPrompt
                    onWrite={() => openCompose()}
                    onPickStarter={(text) => openCompose(text)}
                    onDismiss={dismissPrompt}
                  />
                </FadeIn>
              )}
              <ForumThreadList
                loading={loading}
                threads={threads}
                sort={sort}
                setSort={setSort}
                voted={voted}
                toggleVote={toggleVote}
                filtered={cat !== "all"}
                onShowAll={() => setCat("all")}
                onCompose={() => openCompose()}
              />

              {hasNextPage && (
                <div className={styles.loadMore}>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isFetchingNextPage}
                    onClick={fetchNextPage}
                  >
                    {isFetchingNextPage
                      ? t("forum:threadList.loadingMore")
                      : t("forum:threadList.loadMoreCta")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {composing && (
        <ComposeThreadModal
          initialTitle={composeSeed}
          onClose={() => setComposing(false)}
          onPublish={publishThread}
        />
      )}
    </PageShell>
  );
}
