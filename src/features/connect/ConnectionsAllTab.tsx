import { useMemo, useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ConnectionsGridSkeleton } from "./ConnectionsSkeleton";
import { AllConnectionCard } from "./ConnectionCards";
import { ConnectionsEmpty, ConnectionsNoMatches } from "./ConnectionsEmpty";
import type { ConnectionSort } from "./api/connections.api";
import { filterAndSortViews } from "./connectionsFilter";
import {
  MORE_POOL,
  MORE_PER_PAGE,
  connectionViews,
  type ConnectionView,
} from "./connections.data";
import styles from "./ConnectionsPage.module.css";

export function ConnectionsAllTab({
  loading,
  connected,
  searchTerm,
  sort,
  onClearSearch,
  allowMorePool = true,
  isBlocked,
  onUnblock,
  onMessage,
}: {
  loading: boolean;
  /** The already-resolved connection cards for this tab. */
  connected: ConnectionView[];
  /** The live search term. The server applies it in live mode; it is passed in
   *  so the empty state can tell "no connections" from "no matches". */
  searchTerm: string;
  sort: ConnectionSort;
  onClearSearch: () => void;
  /** Whether the mock "Load more" pool is offered (demo only: the live API
   *  paginates its own list, so it would splice in fake members otherwise). */
  allowMorePool?: boolean;
  isBlocked: (slug: string) => boolean;
  onUnblock: (v: ConnectionView) => void;
  onMessage: (slug: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const [morePages, setMorePages] = useState(0);

  const revealedSlugs = useMemo(
    () => (allowMorePool ? MORE_POOL.slice(0, morePages * MORE_PER_PAGE) : []),
    [allowMorePool, morePages],
  );
  const hasMore = allowMorePool && revealedSlugs.length < MORE_POOL.length;

  /**
   * Live mode renders exactly what the server sent: it already applied the
   * search term and the ordering across the whole list, so filtering again
   * here would drop rows it matched on a field the local matcher never reads.
   *
   * Demo mode has no server, so the revealed "Load more" members are merged in
   * and the same rules are applied locally to the combined list.
   */
  const visibleAll = useMemo(() => {
    if (!allowMorePool) return connected;
    const seen = new Set(connected.map((view) => view.slug));
    const extra = connectionViews(revealedSlugs).filter(
      (view) => !seen.has(view.slug),
    );
    return filterAndSortViews([...connected, ...extra], searchTerm, sort);
  }, [allowMorePool, connected, revealedSlugs, searchTerm, sort]);

  if (loading) return <ConnectionsGridSkeleton count={6} />;

  const isSearching = searchTerm.trim() !== "";

  return (
    <>
      <div className={styles.grid}>
        {visibleAll.map((view, index) => (
          <FadeIn
            key={view.slug}
            delay={Math.min(index, 8) * 60}
            className={styles.cardFade}
          >
            <AllConnectionCard
              view={view}
              blocked={isBlocked(view.slug)}
              onUnblock={() => onUnblock(view)}
              onMessage={() => onMessage(view.slug, view.name)}
            />
          </FadeIn>
        ))}
      </div>
      {visibleAll.length === 0 &&
        (isSearching ? (
          <ConnectionsNoMatches onClear={onClearSearch} />
        ) : (
          <ConnectionsEmpty />
        ))}
      {hasMore && !isSearching && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setMorePages((pages) => pages + 1)}
          >
            {t("connect:allTab.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}
