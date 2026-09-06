import { PageShell } from "../../shared/components/layout";
import { FadeIn, LoadErrorState } from "../../shared/components/ui";
import { ComposeThreadModal } from "./ComposeThreadModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { EditTitleModal } from "./EditTitleModal";
import { FirstPostPrompt } from "./FirstPostPrompt";
import { ForumEditHistoryModal } from "./ForumEditHistoryModal";
import { ForumSidebar } from "./ForumSidebar";
import { ForumThreadList } from "./ForumThreadList";
import { ForumHero } from "./ForumHero";
import { MoveCategoryModal } from "./MoveCategoryModal";
import { ForumLoadMore } from "./ForumLoadMore";
import { useForumPageState } from "./useForumPageState";
import styles from "./ForumPage.module.css";

export function ForumPage() {
  const page = useForumPageState();
  const { moderation } = page;

  return (
    <PageShell>
      <ForumHero
        onNewPost={() => page.openCompose()}
        q={page.q}
        onSearch={page.setQ}
      />

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <ForumSidebar
              cat={page.cat}
              setCat={page.setCat}
              counts={page.counts}
              totalCount={page.totalCount}
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
              {page.hasThreadsError ? (
                <LoadErrorState onRetry={page.retryThreads} />
              ) : (
                <ForumThreadList
                  loading={page.loading}
                  threads={page.threads}
                  pinnedThreads={page.pinnedThreads}
                  sort={page.sort}
                  setSort={page.setSort}
                  headerCount={page.headerCount}
                  activeTag={page.tag}
                  onClearTag={() => page.setTag(null)}
                  onTagClick={page.setTag}
                  onVote={page.onVote}
                  filtered={page.filtered}
                  onShowAll={page.resetFilters}
                  onCompose={() => page.openCompose()}
                  canEditThread={page.canEditThread}
                  canMoveCategory={page.canMoveCategory}
                  canDeleteThread={page.canDeleteThread}
                  onEditTitle={(thread) =>
                    page.setEditingTitleThreadId(thread.id)
                  }
                  onMoveCategory={moderation.requestMoveCategory}
                  onDelete={moderation.requestDelete}
                  onRestore={moderation.requestRestore}
                  onHistory={moderation.requestHistory}
                  onTogglePin={moderation.requestTogglePin}
                />
              )}

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
          initialTags={page.composeTags}
          status={page.publishStatus}
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

      {moderation.movingThread && (
        <MoveCategoryModal
          initialCategory={moderation.movingThread.category}
          busy={moderation.moveBusy}
          onSave={moderation.confirmMoveNow}
          onClose={() => moderation.setMovingThread(null)}
        />
      )}

      {/* PRD-160: the row's delete withdraws the WHOLE thread now, so this
          mounts the thread copy, which is honest about what stays and what
          goes. The post copy is still what every other call site gets. */}
      {moderation.confirmDelete && (
        <ConfirmDeleteModal
          busy={moderation.deleteBusy}
          subject="thread"
          onConfirm={moderation.confirmDeleteNow}
          onClose={() => moderation.setConfirmDelete(null)}
        />
      )}

      {moderation.historyPostId && (
        <ForumEditHistoryModal
          postId={moderation.historyPostId}
          onClose={() => moderation.setHistoryPostId(null)}
        />
      )}
    </PageShell>
  );
}
