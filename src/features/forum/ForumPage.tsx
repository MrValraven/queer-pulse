import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { THREADS, SELF_AUTHOR, type Thread } from "./forum.data";
import { ComposeThreadModal, type NewThreadInput } from "./ComposeThreadModal";
import { FirstPostPrompt } from "./FirstPostPrompt";
import { ForumSidebar } from "./ForumSidebar";
import { ForumThreadList } from "./ForumThreadList";
import styles from "./ForumPage.module.css";

const PROMPT_DISMISSED_KEY = "qp_forum_prompt_dismissed";

export function ForumPage() {
  const loading = useSimulatedLoad();
  const [cat, setCat] = useState("all");
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

  const allThreads = useMemo(
    () => [...extraThreads, ...THREADS],
    [extraThreads],
  );

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
    setExtraThreads((prev) => [
      {
        id,
        cat: postCat,
        title,
        excerpt,
        author: SELF_AUTHOR,
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
              <div className={styles.cat}>
                The Public Square · open to every member
              </div>
              <h1>
                The <em>commons</em>
              </h1>
              <p>
                The one community everyone here belongs to — questions,
                proposals, guides, and the slow work of building a movement.
                Take care of each other. Looking for a smaller room?{" "}
                <Link to={routes.communities} className={styles.heroLink}>
                  Find your communities →
                </Link>
              </p>
            </div>
            <Button className={styles.newBtn} onClick={() => openCompose()}>
              + New post
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
                onShowAll={() => setCat("all")}
              />
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
