import { routes } from "../../app/routeMap";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Guide } from "../resources/library.data";
import { SuggestEditTrigger } from "../resources/SuggestEditTrigger";
import { GuideCard, ResourceCardSkeleton } from "./ResourceLibrarySections";
import s from "./ResourceLibraryPage.module.css";

export interface ResourceLibraryGuidesProps {
  /** Every guide loaded so far (before the page's filters). */
  guides: Guide[];
  /** The guides left after the category and search filters. */
  visible: Guide[];
  loading: boolean;
  hasFailedWithoutData: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

/** The library's guide grid with its error, loading and empty states, the
 *  load-more control, the full-index link and the suggest-an-edit trigger. */
export function ResourceLibraryGuides({
  guides,
  visible,
  loading,
  hasFailedWithoutData,
  isRetrying,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: ResourceLibraryGuidesProps) {
  const { t } = useTranslation();
  return (
    <>
      {hasFailedWithoutData && (
        <LoadErrorState
          title={t("marketing:resourceLibrary.loadError.title")}
          description={t("marketing:resourceLibrary.loadError.description")}
          isRetrying={isRetrying}
          onRetry={onRetry}
        />
      )}
      <div className={s.grid}>
        {loading &&
          Array.from({ length: 9 }).map((_, index) => (
            <ResourceCardSkeleton key={index} />
          ))}
        {/* Two different emptinesses, and telling them apart matters: a
            filter that matches nothing is the reader's to fix, whereas a
            library holding nothing at all means no guide has passed
            editorial review yet, and "try a broader filter" would send
            someone hunting for a filter that would not help. */}
        {!loading && !hasFailedWithoutData && visible.length === 0 && (
          <div className={s.empty}>
            {guides.length === 0
              ? t("marketing:resourceLibrary.emptyUnreviewed")
              : t("marketing:resourceLibrary.empty")}
          </div>
        )}
        {!loading &&
          visible.map((guide, index) => (
            <GuideCard key={guide.title} guide={guide} index={index} />
          ))}
      </div>

      {!loading && hasNextPage && (
        <div className={s.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={onFetchNextPage}
          >
            {isFetchingNextPage
              ? t("resources:library.loadingMore")
              : t("resources:library.loadMoreCta")}
          </Button>
        </div>
      )}

      {/* CON-10: the library grid only ever linked the guides whose
          cards it renders. This reaches the full index, including the
          guides that had no inbound link anywhere in the app. */}
      <div className={s.loadMore}>
        <Button to={routes.guideIndex} variant="ghost">
          {t("resources:guideIndex.linkCta")}
        </Button>
      </div>

      <SuggestEditTrigger
        subjectOptions={guides.map((guide) => guide.title)}
        context="library"
      />
    </>
  );
}
