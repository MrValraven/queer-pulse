import { FiLayers, FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  EmptyState,
  Reveal,
  SkeletonAvatar,
  SkeletonLine,
  SuccessPanel,
} from "../../shared/components/ui";
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
  const directory = useSubprofileDirectoryFilters();
  const {
    isLoading,
    isError,
    refetch,
    total,
    isNarrowedInBrowser,
    shownCards,
    hasMore,
    isFetchingMore,
    onShowMore,
    onClearFilters,
  } = directory;

  return (
    <>
      <SubprofileDirectoryToolbar
        directory={directory}
        isCountKnown={!isLoading && !isError}
      />

      {isLoading ? (
        <DirectoryLoadingGrid />
      ) : isError ? (
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
      ) : shownCards.length === 0 ? (
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
          <div className={styles.grid}>
            {shownCards.map((card, index) => (
              <Reveal key={card.handle} delay={Math.min(index, 8) * 60}>
                <SubprofileCard card={card} />
              </Reveal>
            ))}
          </div>
          <div className={styles.pager}>
            <span className={styles.pagerCount}>
              {t("subprofiles:directory.shownOfTotal", {
                shown: shownCards.length,
                total,
              })}
            </span>
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowMore}
                disabled={isFetchingMore}
              >
                {isFetchingMore
                  ? t("subprofiles:directory.showMoreLoading")
                  : t("subprofiles:directory.showMore")}
              </Button>
            )}
          </div>
          {/* Profession, tags and availability have no server param yet, so
              they cut the pages loaded so far. Saying so is the difference
              between a partial answer and a wrong one. */}
          {isNarrowedInBrowser && hasMore && (
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
