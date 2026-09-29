import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SearchInput,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDebouncedValue, useSimulatedLoad } from "../../shared/hooks";
import { ReportReplyModal } from "../forum/ReportReplyModal";
import type { LivingCommunity } from "./community.model";
import { useCommunityTime } from "./communityTime";
import {
  useCommunityPostSearch,
  type PulsePaging,
} from "./api/useCommunityPosts";
import { PulseComposerArea } from "./PulseComposerArea";
import { PulseFeedList } from "./PulseFeedList";
import { PulseFeedPost } from "./PulseFeedPost";
import { usePulseFeedData } from "./usePulseFeedData";
import { usePulseTabActions } from "./usePulseTabActions";
import styles from "./PulseTab.module.css";

function PulseFeedSkeleton() {
  return (
    <div aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className={styles.post} key={index}>
          <div className={styles.pHead}>
            <SkeletonAvatar size={40} />
            <SkeletonLine height={12} width="40%" />
          </div>
          <SkeletonLine height={12} style={{ margin: "14px 0 6px" }} />
          <SkeletonLine height={12} width="80%" />
        </div>
      ))}
    </div>
  );
}

export function PulseTab({
  community,
  name,
  isMember,
  canModerate = false,
  canAnnounce = false,
  frozen = false,
  paging,
}: {
  community: LivingCommunity;
  name: string;
  isMember: boolean;
  /** Owner/mod — gates the pin/unpin action on each post. */
  canModerate?: boolean;
  /** Owner, co-owner or moderator — gates the composer's announcement switch.
   *  A plain member who somehow sent one would get a 403 from the server. */
  canAnnounce?: boolean;
  /** True while the community is auto-frozen — swaps the composer for an
   *  explanation instead of leaving it open to a 403. */
  frozen?: boolean;
  /** Live-mode pagination for the feed; inert in demo (`hasNextPage: false`). */
  paging: PulsePaging;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const communityTime = useCommunityTime();
  const actions = usePulseTabActions(community);
  // The 500ms placeholder skeleton is a demo-prototype device. Live mode reads
  // the real first-page fetch state instead, so cached data paints at once and
  // a slow fetch is shown honestly for as long as it actually takes.
  const isSimulatedLoading = useSimulatedLoad(500);
  const isLoading = demoMode ? isSimulatedLoading : !!paging.isLoading;

  // Server-side search across the community's whole history, so a match on
  // page 40 is found without the member ever loading page 40. The term is
  // debounced because every keystroke would otherwise be a request.
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), 300);
  const isSearching = debouncedSearchTerm.length > 0;
  const search = useCommunityPostSearch(community.slug, debouncedSearchTerm);

  const { pinnedPosts, feed, isFeedEmpty } = usePulseFeedData(
    community,
    actions,
  );

  const postProps = {
    roleOf: actions.roleOf,
    isMember,
    viewer: actions.viewer,
    canModerate,
    onReactPost: actions.onReactPost,
    onReplyPost: actions.onReplyPost,
    onTogglePin: actions.onTogglePin,
    onReportPost: actions.onReportPost,
    onReportReply: actions.onReportReply,
  };

  if (isLoading) return <PulseFeedSkeleton />;

  return (
    <div>
      <PulseComposerArea
        communitySlug={community.slug}
        name={name}
        isMember={isMember}
        frozen={frozen}
        canAnnounce={canAnnounce}
        actions={actions}
      />

      {/* Live only: demo mode has no server to search, and its whole feed is
          already on screen. */}
      {!demoMode && (
        <div className={styles.searchRow}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            className={styles.searchInput}
            placeholder={t("communities:detail.pulse.search.placeholder", {
              name,
            })}
            ariaLabel={t("communities:detail.pulse.search.ariaLabel", { name })}
          />
        </div>
      )}

      {isSearching ? (
        <PulseSearchResults
          searchTerm={debouncedSearchTerm}
          search={search}
          postProps={postProps}
        />
      ) : (
        <PulseFeedList
          pinnedPosts={pinnedPosts}
          feed={feed}
          isFeedEmpty={isFeedEmpty}
          isMember={isMember}
          paging={paging}
          postProps={postProps}
          momentAgo={communityTime.ago}
        />
      )}

      {actions.reportTarget && (
        <ReportReplyModal
          authorName={actions.reportTarget.authorName}
          subjectId={actions.reportTarget.subjectId}
          subjectType={actions.reportTarget.subjectType}
          onClose={() => actions.setReportTarget(null)}
        />
      )}
    </div>
  );
}

/**
 * The search half of the Pulse tab: matches, their own load-more, and the
 * empty/failed states. Its own component so `PulseTab` stays under the repo's
 * 200-line limit.
 *
 * The results carry no "only the posts already loaded" caveat, because there
 * is none: the backend applies `q` in-query across the community's whole
 * history, so what is missing from these results is genuinely not there.
 */
function PulseSearchResults({
  searchTerm,
  search,
  postProps,
}: {
  searchTerm: string;
  search: ReturnType<typeof useCommunityPostSearch>;
  postProps: Parameters<typeof PulseFeedPost>[0]["postProps"];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (search.isLoading) return <PulseFeedSkeleton />;

  if (search.isError) {
    return (
      <EmptyState
        icon={<FiSearch />}
        title={t("communities:detail.pulse.search.errorTitle")}
        description={t("communities:detail.pulse.search.errorDescription")}
      />
    );
  }

  if (search.matches.length === 0) {
    return (
      <EmptyState
        icon={<FiSearch />}
        title={t("communities:detail.pulse.search.emptyTitle")}
        description={t("communities:detail.pulse.search.emptyDescription", {
          term: searchTerm,
        })}
      />
    );
  }

  return (
    <>
      <p className={styles.searchCount} role="status">
        <Translation
          i18nKey="communities:detail.pulse.search.resultCount"
          values={{ count: search.matches.length }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(search.matches.length)}
                numericValue={search.matches.length}
              />
            ),
          }}
        />
      </p>
      {search.matches.map((post) => (
        <FadeIn key={post.id} className={styles.rowFade}>
          <PulseFeedPost post={post} postProps={postProps} />
        </FadeIn>
      ))}
      {search.hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={search.isFetchingNextPage}
            onClick={search.fetchNextPage}
          >
            {search.isFetchingNextPage
              ? t("communities:detail.pulse.loadingMore")
              : t("communities:detail.pulse.search.loadMoreCta")}
          </Button>
        </div>
      )}
    </>
  );
}
