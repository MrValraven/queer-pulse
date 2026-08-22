import { useEffect, useRef, useState } from "react";
import { FiFileText } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./PressArchivePage.module.css";
import { Button, EmptyState, HubBackLink } from "../../shared/components/ui";
import {
  PRESS_CHIPS,
  PRESS_DATA,
  PRESS_OLDER,
  type Piece,
  type YearGroup,
} from "./pressArchive.data";
import { PressArchiveFilters } from "./PressArchiveFilters";
import { PressArchiveList, PressArchiveYearSkeleton } from "./PressArchiveList";

/** Text a piece is searched against. The title/source can be JSX, so we match
 *  the string fields (outlet, source kind, kind, and source when it's a string). */
function searchableText(piece: Piece): string {
  const sourceText = typeof piece.source === "string" ? piece.source : "";
  return `${piece.out} ${piece.sourceKind} ${piece.kind} ${sourceText}`.toLowerCase();
}

export function PressArchivePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const { showToast } = useToast();
  const [chipIndex, setChipIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [extra, setExtra] = useState<YearGroup[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  // Clear the pending "load more" timer on unmount so we never setState after it.
  const loadMoreTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(loadMoreTimerRef.current), []);

  const loadMore = () => {
    if (loadingMore || extra.length >= PRESS_OLDER.length) return;
    setLoadingMore(true);
    loadMoreTimerRef.current = window.setTimeout(() => {
      setExtra((prev) => [...prev, PRESS_OLDER[prev.length]!]);
      setLoadingMore(false);
    }, 700);
  };
  const allLoaded = extra.length >= PRESS_OLDER.length;

  // Category chip + search now actually filter the list (they used to only
  // toggle styling). Groups left with no matching pieces are dropped.
  const activeMatch = PRESS_CHIPS[chipIndex]?.match ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleGroups = [...PRESS_DATA, ...extra]
    .map((group) => ({
      ...group,
      pieces: group.pieces.filter((piece) => {
        const matchesChip =
          !activeMatch || piece.sourceKind.toLowerCase().includes(activeMatch);
        const matchesQuery =
          !normalizedQuery || searchableText(piece).includes(normalizedQuery);
        return matchesChip && matchesQuery;
      }),
    }))
    .filter((group) => group.pieces.length > 0);

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:pressArchive.meta.title")}
        description={t("marketing:pressArchive.meta.description")}
        canonical={routes.pressArchive}
      />
      <div className={styles.page}>
        <HubBackLink
          to={routes.pressKit}
          label={t("marketing:pressArchive.hero.backLabel")}
        />
        <header className={styles.head}>
          <div>
            <div className={styles.eye}>
              {t("marketing:pressArchive.hero.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="marketing:pressArchive.hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.sub}>
              <Translation
                i18nKey="marketing:pressArchive.hero.sub"
                components={{ em: <em /> }}
              />
            </p>
          </div>
          {/* The coverage counts + the archive rows below are prototype
              fiction (invented outlets, headlines, an interview). There is no
              live press feed yet, so live mode hides the fabricated stats and
              renders an honest empty state in place of the archive. */}
          {demoMode && (
            <div className={styles.stats}>
              <span>
                <b>
                  <em>54</em>
                </b>
                {t("marketing:pressArchive.stats.allTime")}
              </span>
              <span>
                <b>6</b>
                {t("marketing:pressArchive.stats.languages")}
              </span>
              <span>
                <b>
                  <em>14</em>
                </b>
                {t("marketing:pressArchive.stats.thisYear")}
              </span>
            </div>
          )}
        </header>

        {!demoMode ? (
          <EmptyState
            icon={<FiFileText />}
            title={t("marketing:pressArchive.live.title")}
            description={t("marketing:pressArchive.live.body")}
          />
        ) : (
          <>
            <PressArchiveFilters
              query={query}
              onQueryChange={setQuery}
              chipIndex={chipIndex}
              onChipIndexChange={setChipIndex}
            />

            <PressArchiveList
              groups={visibleGroups}
              isLoading={loading}
              onOpenPiece={(piece) => {
                showToast(
                  t("marketing:pressArchive.toast.opening", {
                    source: piece.out,
                  }),
                  "info",
                );
              }}
            />

            {loadingMore && <PressArchiveYearSkeleton />}

            {!loading && !allLoaded && (
              <div className={styles.loadMore}>
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  disabled={loadingMore}
                  aria-busy={loadingMore}
                >
                  {loadingMore
                    ? t("marketing:pressArchive.loadingMore")
                    : t("marketing:pressArchive.loadMoreCta")}
                </Button>
              </div>
            )}
            {!loading && allLoaded && (
              <div className={styles.loadMore}>
                <span className={styles.end}>
                  {t("marketing:pressArchive.endOfArchive")}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
