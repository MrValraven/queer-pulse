import { useMemo } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  FadeIn,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../../shared/components/ui";
import { LoadMoreFooter } from "../../../shared/components/ui/LoadMoreFooter";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityShelfGiftDTO } from "./api/communityBadges.api";
import { useSetCommunityGiftHidden } from "./api/useCommunityGiftMutations";
import { useMyCommunityGifts } from "./api/useCommunityGifts";
import { communityBadgeErrorText } from "./communityBadgeErrors";
import { CommunityGiftShelfRow } from "./CommunityGiftShelfRow";
import styles from "./CommunityBadgeSheet.module.css";

export interface CommunityGiftShelfProps {
  slug: string;
  /** The community the shelf belongs to. The shelf copy names no community,
   *  so it only rides along for parity with the badge list. */
  communityName: string;
}

const SKELETON_ROWS = [0, 1, 2];

const newestFirst = (
  left: CommunityShelfGiftDTO,
  right: CommunityShelfGiftDTO,
) => Date.parse(right.sentAt) - Date.parse(left.sentAt);

/**
 * The member's own gifts in this community, newest first and hidden ones
 * included. Only the recipient ever sees this shelf; a gift's mark shows
 * beside their name for 7 days unless they hide it here.
 */
export function CommunityGiftShelf({ slug }: CommunityGiftShelfProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const shelf = useMyCommunityGifts(slug);
  const setGiftHidden = useSetCommunityGiftHidden(slug);
  const pendingGiftId = setGiftHidden.isPending
    ? (setGiftHidden.variables?.giftId ?? null)
    : null;
  const gifts = useMemo(
    () => [...shelf.gifts].sort(newestFirst),
    [shelf.gifts],
  );

  const toggleHidden = (gift: CommunityShelfGiftDTO) => {
    setGiftHidden.mutate(
      { giftId: gift.id, isHidden: !gift.isHidden },
      {
        onSuccess: (updated) => {
          showToast(
            updated.isHidden
              ? t("communities:badges.shelf.hiddenToast")
              : t("communities:badges.shelf.shownToast"),
            "success",
          );
        },
        onError: (error) => {
          showToast(communityBadgeErrorText(error, t, fmt), "error");
        },
      },
    );
  };

  return (
    <div className={styles.shelf}>
      <p className={styles.shelfLead}>{t("communities:badges.shelf.lead")}</p>
      {shelf.isLoading && (
        <div className={styles.list} aria-hidden>
          {SKELETON_ROWS.map((index) => (
            <div key={index} className={styles.skeletonRow}>
              <SkeletonAvatar size={40} />
              <SkeletonLine width="60%" />
            </div>
          ))}
        </div>
      )}
      {shelf.isError && gifts.length === 0 && (
        <LoadErrorState
          compact
          onRetry={shelf.refetch}
          isRetrying={shelf.isRefetching}
          description={communityBadgeErrorText(shelf.error, t, fmt)}
        />
      )}
      {!shelf.isLoading && !shelf.isError && gifts.length === 0 && (
        <FadeIn as="p" className={styles.empty}>
          {t("communities:badges.shelf.empty")}
        </FadeIn>
      )}
      {gifts.length > 0 && (
        <ul className={styles.list}>
          {gifts.map((gift, index) => (
            <FadeIn
              as="li"
              key={gift.id}
              delay={Math.min(index, 5) * 40}
              className={styles.listItem}
            >
              <CommunityGiftShelfRow
                gift={gift}
                isPending={pendingGiftId === gift.id}
                onToggleHidden={() => toggleHidden(gift)}
              />
            </FadeIn>
          ))}
        </ul>
      )}
      {shelf.hasNextPage && (
        <LoadMoreFooter
          isFetchingNextPage={shelf.isFetchingNextPage}
          isFetchNextPageError={shelf.isFetchNextPageError}
          onLoadMore={shelf.fetchNextPage}
          errorMessage={t("common:error.loadMore")}
          label={t("communities:badges.shelf.loadMore")}
          loadingLabel={t("common:loading.label")}
        />
      )}
    </div>
  );
}
