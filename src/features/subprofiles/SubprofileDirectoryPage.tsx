import { useMemo } from "react";
import { FiLayers, FiAlertCircle } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FeatureHelp,
  Reveal,
  Spinner,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileDirectory } from "./api/useSubprofileDirectory";
import { SubprofileCard } from "./SubprofileCard";
import { SubprofileDirectoryFilters } from "./SubprofileDirectoryFilters";
import { SubprofileDirectoryFooterPrompt } from "./SubprofileDirectoryFooterPrompt";
import { useSubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * Browse standalone (unlinked + published) personas across the community,
 * filterable by skin family, tag, free-text search, and open-to-collabs.
 * Wrapped in `AppShell` (logged-in). Personas redesign Phase 4 (Decision §2):
 * the directory fetches the FULL standalone set once and applies every
 * filter — family, tags, search, collabs — client-side, via
 * `useSubprofileDirectoryFilters` (kept in its own file so this component
 * stays under the 200-line cap).
 */
export function SubprofileDirectoryPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useSubprofileDirectory();
  const cards = useMemo(() => data ?? [], [data]);

  const {
    family,
    setFamily,
    query,
    setQuery,
    activeTags,
    onToggleTag,
    openToCollabs,
    onToggleOpenToCollabs,
    availableTags,
    filtersNote,
    visibleCards,
    shownCards,
    hasMore,
    onShowMore,
    onClearFilters,
  } = useSubprofileDirectoryFilters(cards);

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

          <SubprofileDirectoryFilters
            activeFamily={family}
            onFamily={setFamily}
            query={query}
            onQuery={setQuery}
            availableTags={availableTags}
            activeTags={activeTags}
            onToggleTag={onToggleTag}
            openToCollabs={openToCollabs}
            onToggleOpenToCollabs={onToggleOpenToCollabs}
            filtersNote={filtersNote}
          />

          {isLoading ? (
            <div className={styles.stateWrap} role="status" aria-live="polite">
              <Spinner />
              <span>{t("subprofiles:directory.loading")}</span>
            </div>
          ) : isError ? (
            // Distinct from the empty state: a failed fetch must not read as
            // "no personas yet" — offer a retry rather than a filter clear.
            <EmptyState
              icon={<FiAlertCircle />}
              title={t("subprofiles:directory.error.title")}
              description={t("subprofiles:directory.error.description")}
              action={{
                label: t("subprofiles:directory.error.retry"),
                onClick: () => void refetch(),
              }}
            />
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
