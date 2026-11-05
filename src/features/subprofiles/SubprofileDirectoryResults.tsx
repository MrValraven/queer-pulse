import { FiLayers, FiAlertTriangle } from "react-icons/fi";
import { EmptyState, Reveal, SuccessPanel } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofilePortraitCard } from "./SubprofilePortraitCard";
import { SubprofileDirectoryLoadingGrid } from "./SubprofileDirectoryLoadingGrid";
import { SubprofileDirectoryPager } from "./SubprofileDirectoryPager";
import { toPortraitCardView } from "./api/directoryCard.adapters";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * The persona grid under the results top: the loading grid, the error panel,
 * the empty state, or the portrait cards with their "Show more" pager. The
 * closing band under the frame takes the place the footer prompt had. Moved
 * out of `SubprofileDirectoryBrowse` when that grew the filter page's layout
 * and sheet, so each stays under the 200-line cap.
 */
export function SubprofileDirectoryResults({
  directory,
  hasNothingLoadedError,
}: {
  directory: SubprofileDirectoryFilters;
  /** ENG-501: react-query also sets `isError` when only the next page
   *  failed. This is the outage with nothing loaded; loaded cards stay and
   *  the pager below retries the page that failed. */
  hasNothingLoadedError: boolean;
}) {
  const { t } = useTranslation();
  const {
    isLoading,
    isFetchNextPageError,
    refetch,
    total,
    shownCards,
    hasMore,
    isFetchingMore,
    onShowMore,
    onClearFilters,
  } = directory;

  if (isLoading) {
    return (
      <SubprofileDirectoryLoadingGrid
        label={t("subprofiles:directory.loading")}
      />
    );
  }

  if (hasNothingLoadedError) {
    // Distinct from the empty state: a failed fetch must not read as "no
    // personas yet". Per docs/STYLE-RULES.md an error surface is the plum
    // panel (never a light card): the same `SuccessPanel` treatment
    // `ErrorSides` gives the dashboard, its jade check swapped for a coral
    // alert and its action repurposed as a retry.
    return (
      <SuccessPanel
        title={t("subprofiles:directory.error.title")}
        icon={<FiAlertTriangle size={26} color="var(--accent)" aria-hidden />}
        iconTone="coral"
        onClose={refetch}
        closeLabel={t("subprofiles:directory.error.retry")}
      >
        {t("subprofiles:directory.error.description")}
      </SuccessPanel>
    );
  }

  if (shownCards.length === 0 && !hasMore) {
    // Genuinely nothing left: the search and the sidebar's filters, all
    // applied server-side over the whole table, matched nobody. PRD-430:
    // this is the ONLY condition that reads as "no personas".
    return (
      <EmptyState
        icon={<FiLayers />}
        title={t("subprofiles:directory.empty.title")}
        description={t("subprofiles:directory.empty.description")}
        action={{
          label: t("subprofiles:directory.empty.clear"),
          onClick: onClearFilters,
        }}
      />
    );
  }

  return (
    <>
      {shownCards.length > 0 && (
        <div className={styles.grid}>
          {shownCards.map((card, index) => {
            const view = toPortraitCardView(card);
            return (
              <Reveal key={view.key} delay={Math.min(index, 8) * 60}>
                {/* h3 under the section's visually hidden h2. */}
                <SubprofilePortraitCard view={view} headingLevel="h3" />
              </Reveal>
            );
          })}
        </div>
      )}
      {/* Show more and the filters move the shown figure; a new search term
          moves the server total. */}
      <SubprofileDirectoryPager
        shownCount={shownCards.length}
        total={total}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        isFetchNextPageError={isFetchNextPageError}
        onShowMore={onShowMore}
        isBare={shownCards.length === 0}
      />
    </>
  );
}
