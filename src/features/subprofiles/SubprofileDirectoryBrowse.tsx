import { FiLayers, FiAlertTriangle } from "react-icons/fi";
import {
  EmptyState,
  LoadMoreButton,
  LoadMoreStatus,
  Reveal,
  SkeletonAvatar,
  SkeletonLine,
  SuccessPanel,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileCard } from "./SubprofileCard";
import { SubprofileDirectoryToolbar } from "./SubprofileDirectoryToolbar";
import { SubprofileDirectoryFooterPrompt } from "./SubprofileDirectoryFooterPrompt";
import { useSubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * The hub's "everyone" tab: the searchable, filterable grid of standalone
 * (unlinked + published) personas.
 *
 * Extracted from `SubprofileDirectoryPage` when the hub grew its second tab,
 * so the page stays a thin frame under the 200-line cap and neither tab's body
 * has to know the other exists. `useSubprofileDirectoryFilters` lives here now
 * rather than on the page, which also means the directory fetch does not run
 * at all while the Following tab is on screen.
 */
export function SubprofileDirectoryBrowse() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const directory = useSubprofileDirectoryFilters();
  const {
    isLoading,
    isError,
    isFetchNextPageError,
    refetch,
    total,
    isNarrowedInBrowser,
    shownCards,
    hasMore,
    isFetchingMore,
    onShowMore,
    onClearFilters,
  } = directory;
  // ENG-501: react-query also sets `isError` when only the next page failed.
  // The error panel is for a directory with nothing loaded; loaded cards stay
  // and the pager below retries the page that failed.
  const hasNothingLoadedError = isError && !isFetchNextPageError;

  return (
    <>
      <SubprofileDirectoryToolbar
        directory={directory}
        isCountKnown={!isLoading && !hasNothingLoadedError}
      />

      {isLoading ? (
        <DirectoryLoadingGrid />
      ) : hasNothingLoadedError ? (
        // Distinct from the empty state: a failed fetch must not read as
        // "no personas yet". Per docs/STYLE-RULES.md an error surface is the
        // plum panel (never a light card) — the same `SuccessPanel`
        // treatment `ErrorSides` gives the dashboard, its jade check swapped
        // for a coral alert and its action repurposed as a retry.
        <SuccessPanel
          title={t("subprofiles:directory.error.title")}
          icon={<FiAlertTriangle size={26} color="var(--accent)" aria-hidden />}
          iconTone="coral"
          onClose={refetch}
          closeLabel={t("subprofiles:directory.error.retry")}
        >
          {t("subprofiles:directory.error.description")}
        </SuccessPanel>
      ) : shownCards.length === 0 && !hasMore ? (
        // Genuinely nothing left: either the server term itself matched
        // nobody, or every loaded page is exhausted and a browser-only facet
        // (profession, tags, availability) narrowed what's left to zero.
        // PRD-430: this is the ONLY condition that reads as "no personas".
        // A filter that merely narrows the pages already loaded keeps the
        // grid's pager below on screen, since later pages may still match.
        <EmptyState
          icon={<FiLayers />}
          title={t("subprofiles:directory.empty.title")}
          description={t("subprofiles:directory.empty.description")}
          action={{
            label: t("subprofiles:directory.empty.clear"),
            onClick: onClearFilters,
          }}
        />
      ) : (
        <>
          {shownCards.length > 0 && (
            <div className={styles.grid}>
              {shownCards.map((card, index) => (
                <Reveal key={card.handle} delay={Math.min(index, 8) * 60}>
                  <SubprofileCard card={card} />
                </Reveal>
              ))}
            </div>
          )}
          {/* PRD-430: every loaded page is exhausted and a browser-only facet
              narrowed the grid to zero, but a further server page might still
              match. That's the moment this explanation matters most, so it
              leads at body size here. The quiet caption below stays for the
              non-zero case. */}
          {shownCards.length === 0 && isNarrowedInBrowser && hasMore && (
            <p className={styles.pagerNoteLead}>
              {t("subprofiles:directory.narrowedZeroNote")}
            </p>
          )}
          <div
            className={
              shownCards.length > 0
                ? styles.pager
                : `${styles.pager} ${styles.pagerBare}`
            }
          >
            <span className={styles.pagerCount}>
              {/* Show more and the filters move the shown figure; a new
                  search term moves the server total. */}
              <Translation
                i18nKey="subprofiles:directory.shownOfTotal"
                values={{ shown: shownCards.length, total }}
                slots={{
                  shown: (
                    <RollingNumber
                      value={fmt.number(shownCards.length)}
                      numericValue={shownCards.length}
                    />
                  ),
                  total: (
                    <RollingNumber
                      value={fmt.number(total)}
                      numericValue={total}
                    />
                  ),
                }}
              />
            </span>
            {/* The failure line sits between the count and its Retry. */}
            <LoadMoreStatus
              className={styles.pagerStatus}
              messageClassName={styles.pagerStatusMessage}
              isFetchingNextPage={isFetchingMore}
              isFetchNextPageError={hasMore && isFetchNextPageError}
              errorMessage={t("subprofiles:directory.showMoreError")}
            />
            {hasMore && (
              <LoadMoreButton
                size="sm"
                className={styles.pagerShowMore}
                isFetchingNextPage={isFetchingMore}
                isFetchNextPageError={isFetchNextPageError}
                onLoadMore={onShowMore}
                label={t("subprofiles:directory.showMore")}
                loadingLabel={t("subprofiles:directory.showMoreLoading")}
              />
            )}
          </div>
          {/* Profession, tags and availability have no server param yet, so
              they cut the pages loaded so far. Saying so is the difference
              between a partial answer and a wrong one. The zero-shown case
              gets the louder `.pagerNoteLead` above instead, so this quiet
              caption only covers the non-zero case here. */}
          {shownCards.length > 0 && isNarrowedInBrowser && hasMore && (
            <p className={styles.pagerNote}>
              {t("subprofiles:directory.narrowedNote")}
            </p>
          )}
          <SubprofileDirectoryFooterPrompt />
        </>
      )}
    </>
  );
}

/** How many placeholder cards the loading grid renders — roughly a first
 *  viewport's worth, matching the directory's initial `PER_PAGE` reveal. */
const DIRECTORY_SKELETON_COUNT = 6;

/**
 * Card-skeleton grid shown while the standalone-persona set loads. Renders into
 * the SAME `.grid` the real `SubprofileCard`s use, so the real data lands with
 * no layout jump, and reuses the dashboard's skeleton vocabulary
 * (`SkeletonAvatar` over shimmer `SkeletonLine` bars — mirrors `LoadingSides`)
 * shaped to the directory card's header-wash + cut-out-avatar silhouette. One
 * `aria-busy` region rather than one announcement per cell; the cells
 * themselves are decorative.
 */
function DirectoryLoadingGrid() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.grid}
      role="status"
      aria-busy="true"
      aria-label={t("subprofiles:directory.loading")}
    >
      {Array.from({ length: DIRECTORY_SKELETON_COUNT }, (_, index) => (
        <div className={styles.skCard} key={index} aria-hidden>
          <div className={styles.skHeader} />
          <div className={styles.skAvatar}>
            <SkeletonAvatar size={60} />
          </div>
          <div className={styles.skBody}>
            <SkeletonLine width="42%" height={12} />
            <SkeletonLine width="70%" height={20} />
            <SkeletonLine width="90%" height={14} />
            <div className={styles.skTags}>
              <SkeletonLine
                width={54}
                height={22}
                style={{ borderRadius: 999 }}
              />
              <SkeletonLine
                width={68}
                height={22}
                style={{ borderRadius: 999 }}
              />
              <SkeletonLine
                width={46}
                height={22}
                style={{ borderRadius: 999 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
