import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, LoadErrorState } from "../../shared/components/ui";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { EditTitleModal } from "./EditTitleModal";
import { FirstPostPrompt } from "./FirstPostPrompt";
import { ForumEditHistoryModal } from "./ForumEditHistoryModal";
import { ForumSidebar } from "./ForumSidebar";
import { ForumThreadList } from "./ForumThreadList";
import { FundingCategoryBar } from "./funding/FundingCategoryBar";
import { FUNDING_CATEGORY_ID } from "./funding/funding.data";
import { FundingEmptyState } from "./funding/FundingEmptyState";
import { FundingFollowButton } from "./funding/FundingFollowButton";
import { isFundingAuthor } from "./funding/fundingPermissions";
import { ForumHero } from "./ForumHero";
import { MoveCategoryModal } from "./MoveCategoryModal";
import { ForumLoadMore } from "./ForumLoadMore";
import { useForumPageState } from "./useForumPageState";
import styles from "./ForumPage.module.css";

export function ForumPage() {
  const page = useForumPageState();
  const { moderation } = page;
  const { demoMode } = useDemoMode();
  // A search or a tag narrows the view further, so the generic "nothing
  // matches" state speaks for those; the view's own copy needs neither.
  const fundingEmptyView =
    page.cat === FUNDING_CATEGORY_ID &&
    page.fundingView !== "all" &&
    !page.q &&
    !page.tag
      ? page.fundingView
      : null;

  return (
    <PageShell>
      <ForumHero q={page.q} onSearch={page.setQ} />

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
                  <FirstPostPrompt onDismiss={page.dismissPrompt} />
                </FadeIn>
              )}
              {page.cat === FUNDING_CATEGORY_ID && (
                <FundingCategoryBar
                  view={page.fundingView}
                  onViewChange={page.setFundingView}
                  eligibility={page.eligibility}
                  onToggleEligibility={page.toggleEligibility}
                  scope={page.scope}
                  onScopeChange={page.setScope}
                  onClearFilters={page.clearFundingFilters}
                  followSlot={<FundingFollowButton />}
                />
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
                  hasServerOrder={page.hasServerOrder}
                  emptyStateSlot={
                    fundingEmptyView && (
                      <FundingEmptyState
                        view={fundingEmptyView}
                        hasFilters={page.eligibility.length > 0 || !!page.scope}
                        onClearFilters={page.clearFundingFilters}
                        onSeeAll={() => page.setFundingView("all")}
                      />
                    )
                  }
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

      {page.editingThread && (
        <EditTitleModal
          initialTitle={page.editingThread.title}
          busy={page.editingTitleThreadIsBusy}
          onSave={page.saveThreadTitle}
          onClose={page.closeEditTitle}
          shouldShowAskReviewNote={
            page.editingThread.kind === "ask" &&
            isFundingAuthor(page.editingThread, demoMode)
          }
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
