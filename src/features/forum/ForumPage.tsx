import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { ComposeThreadModal } from "./ComposeThreadModal";
import { EditTitleModal } from "./EditTitleModal";
import { FirstPostPrompt } from "./FirstPostPrompt";
import { ForumSidebar } from "./ForumSidebar";
import { ForumThreadList } from "./ForumThreadList";
import { ForumHero } from "./ForumHero";
import { ForumLoadMore } from "./ForumLoadMore";
import { useForumPageState } from "./useForumPageState";
import styles from "./ForumPage.module.css";

export function ForumPage() {
  const page = useForumPageState();

  return (
    <PageShell>
      <ForumHero onNewPost={() => page.openCompose()} />

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <ForumSidebar
              cat={page.cat}
              setCat={page.setCat}
              counts={page.counts}
              totalCount={page.allThreads.length}
            />
            <div>
              {page.showFirstPostPrompt && (
                <FadeIn>
                  <FirstPostPrompt
                    onWrite={() => page.openCompose()}
                    onPickStarter={(text) => page.openCompose(text)}
                    onDismiss={page.dismissPrompt}
                  />
                </FadeIn>
              )}
              <ForumThreadList
                loading={page.loading}
                threads={page.threads}
                sort={page.sort}
                setSort={page.setSort}
                voted={page.voted}
                toggleVote={page.toggleVote}
                filtered={page.cat !== "all"}
                onShowAll={() => page.setCat("all")}
                onCompose={() => page.openCompose()}
                canEditThread={page.canEditThread}
                onEditTitle={(thread) => page.setEditingTitleThreadId(thread.id)}
              />

              <ForumLoadMore
                hasNextPage={page.hasNextPage}
                fetchNextPage={page.fetchNextPage}
                isFetchingNextPage={page.isFetchingNextPage}
              />
            </div>
          </div>
        </div>
      </section>

      {page.composing && (
        <ComposeThreadModal
          initialTitle={page.composeSeed}
          onClose={page.closeCompose}
          onPublish={page.publishThread}
        />
      )}

      {page.editingThread && (
        <EditTitleModal
          initialTitle={page.editingThread.title}
          busy={page.editingTitleThreadIsBusy}
          onSave={page.saveThreadTitle}
          onClose={page.closeEditTitle}
        />
      )}
    </PageShell>
  );
}
