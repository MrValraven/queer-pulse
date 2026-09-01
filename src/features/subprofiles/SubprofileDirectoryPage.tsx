import { useMemo } from "react";
import { FiLayers, FiAlertTriangle } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FeatureHelp,
  Reveal,
  SkeletonAvatar,
  SkeletonLine,
  SuccessPanel,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileDirectory } from "./api/useSubprofileDirectory";
import { SubprofileCard } from "./SubprofileCard";
import { SubprofileDirectoryToolbar } from "./SubprofileDirectoryToolbar";
import { SubprofileDirectoryFooterPrompt } from "./SubprofileDirectoryFooterPrompt";
import { useSubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * Browse standalone (unlinked + published) personas across the community,
 * filterable by profession, tag, free-text search, and open-to-collabs.
 * Wrapped in `AppShell` (logged-in). Personas redesign Phase 4 (Decision §2):
 * the directory fetches the FULL standalone set once and applies every filter
 * (profession, tags, search, collabs) client-side, via
 * `useSubprofileDirectoryFilters`. The controls themselves live in
 * `SubprofileDirectoryToolbar`, so this component stays under the 200-line
 * cap.
 */
export function SubprofileDirectoryPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useSubprofileDirectory();
  const cards = useMemo(() => data ?? [], [data]);

  const directory = useSubprofileDirectoryFilters(cards);
  const { visibleCards, shownCards, hasMore, onShowMore, onClearFilters } =
    directory;

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>
              {t("subprofiles:directory.eyebrow")}
            </span>
            <h1 className={styles.title}>
              <Translation
                i18nKey="subprofiles:directory.title"
                components={{ em: <em /> }}
              />{" "}
              <FeatureHelp id="subprofiles.hub" />
            </h1>
            <p className={styles.sub}>{t("subprofiles:directory.subtitle")}</p>
          </header>

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
              icon={
                <FiAlertTriangle size={26} color="var(--accent)" aria-hidden />
              }
              iconTone="coral"
              onClose={() => void refetch()}
              closeLabel={t("subprofiles:directory.error.retry")}
            >
              {t("subprofiles:directory.error.description")}
            </SuccessPanel>
          ) : visibleCards.length === 0 ? (
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
                {shownCards.map((card, i) => (
                  <Reveal key={card.handle} delay={Math.min(i, 8) * 60}>
                    <SubprofileCard card={card} />
                  </Reveal>
                ))}
              </div>
              <div className={styles.pager}>
                <span className={styles.pagerCount}>
                  {t("subprofiles:directory.shownOfTotal", {
                    shown: shownCards.length,
                    total: visibleCards.length,
                  })}
                </span>
                {hasMore && (
                  <Button variant="ghost" size="sm" onClick={onShowMore}>
                    {t("subprofiles:directory.showMore")}
                  </Button>
                )}
              </div>
              <SubprofileDirectoryFooterPrompt />
            </>
          )}
        </div>
      </div>
    </AppShell>
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
