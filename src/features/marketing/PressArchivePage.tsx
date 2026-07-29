import { useEffect, useRef, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./PressArchivePage.module.css";
import {
  Button,
  FadeIn,
  HubBackLink,
  SkeletonLine,
} from "../../shared/components/ui";
import {
  PRESS_CHIPS,
  PRESS_DATA,
  PRESS_OLDER,
  type Piece,
  type YearGroup,
} from "./pressArchive.data";

function PressRowSkeleton() {
  // Mirrors the real .row grid: date column (auto), title block (1fr), outlet (auto).
  return (
    <div className={styles.row} aria-hidden>
      <div className={styles.date}>
        <SkeletonLine width={56} height={17} />
        <SkeletonLine width={44} height={11} style={{ marginTop: 6 }} />
      </div>
      <div>
        <SkeletonLine width={120} height={11} />
        <SkeletonLine width="70%" height={18} style={{ marginTop: 8 }} />
        <SkeletonLine width="45%" height={12} style={{ marginTop: 6 }} />
      </div>
      <SkeletonLine width={72} height={12} />
    </div>
  );
}

/** Text a piece is searched against. The title/source can be JSX, so we match
 *  the string fields (outlet, source kind, kind, and source when it's a string). */
function searchableText(piece: Piece): string {
  const sourceText = typeof piece.source === "string" ? piece.source : "";
  return `${piece.out} ${piece.sourceKind} ${piece.kind} ${sourceText}`.toLowerCase();
}

export function PressArchivePage() {
  const { t } = useTranslation();
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
        </header>

        <div className={styles.controls}>
          <div className={styles.search}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("marketing:pressArchive.search.placeholder")}
              aria-label={t("marketing:pressArchive.search.placeholder")}
            />
          </div>
          {PRESS_CHIPS.map((chip, index) => (
            <button
              key={chip.labelKey}
              type="button"
              className={[styles.chip, chipIndex === index && styles.chipActive]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={chipIndex === index}
              onClick={() => setChipIndex(index)}
            >
              {t(chip.labelKey, { count: chip.count })}
            </button>
          ))}
        </div>

        {loading ? (
          <div>
            <h2 className={styles.year} aria-hidden>
              <SkeletonLine width={90} height={42} />
            </h2>
            {Array.from({ length: 5 }).map((_unused, skeletonIndex) => (
              <PressRowSkeleton key={skeletonIndex} />
            ))}
          </div>
        ) : visibleGroups.length === 0 ? (
          <p className={styles.empty}>
            {t("marketing:pressArchive.noResults")}
          </p>
        ) : (
          visibleGroups.map((yearGroup) => (
            <div key={yearGroup.year}>
              <h2 className={styles.year}>
                {yearGroup.year.slice(0, 3)}
                <em>{yearGroup.year.slice(3)}</em>
                <span className={styles.ct}>{yearGroup.count}</span>
              </h2>
              {yearGroup.pieces.map((piece, pieceIndex) => (
                <FadeIn key={piece.id} delay={Math.min(pieceIndex, 8) * 60}>
                  <button
                    type="button"
                    className={styles.row}
                    onClick={() => {
                      showToast(
                        t("marketing:pressArchive.toast.opening", {
                          source: piece.out,
                        }),
                        "info",
                      );
                    }}
                  >
                    <div className={styles.date}>
                      {piece.day} <em>{piece.month}</em>
                      <span>{piece.kind}</span>
                    </div>
                    <div>
                      <div
                        className={styles.source}
                        style={
                          piece.sourceMuted
                            ? { color: "var(--ink-60)" }
                            : undefined
                        }
                      >
                        {piece.pin && (
                          <span className={styles.pin}>
                            {t("marketing:pressArchive.pinBadge")}
                          </span>
                        )}
                        {piece.source}
                        <span className={styles.kind}>
                          · {piece.sourceKind}
                        </span>
                      </div>
                      <div className={styles.title}>{piece.title}</div>
                      <div className={styles.meta}>{piece.meta}</div>
                    </div>
                    <div className={styles.out}>{piece.out}</div>
                  </button>
                </FadeIn>
              ))}
            </div>
          ))
        )}

        {loadingMore && (
          <div>
            <h2 className={styles.year} aria-hidden>
              <SkeletonLine width={90} height={42} />
            </h2>
            {Array.from({ length: 5 }).map((_unused, skeletonIndex) => (
              <PressRowSkeleton key={skeletonIndex} />
            ))}
          </div>
        )}

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
      </div>
    </PageShell>
  );
}
