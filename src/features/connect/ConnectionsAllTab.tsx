import { useMemo, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SearchInput,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ConnectionsGridSkeleton } from "./ConnectionsSkeleton";
import { AllConnectionCard } from "./ConnectionCards";
import {
  MORE_POOL,
  MORE_PER_PAGE,
  connectionViews,
  type ConnectionView,
} from "./connections.data";
import styles from "./ConnectionsPage.module.css";

const SORTS = ["Recently connected", "A to Z", "Closest mutuals"] as const;
type Sort = (typeof SORTS)[number];

function matchesView(v: ConnectionView, q: string): boolean {
  return [v.name, v.pron ?? "", v.role, ...v.tags]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function ConnectionsAllTab({
  loading,
  connected,
  allowMorePool = true,
  isBlocked,
  onUnblock,
  onMessage,
}: {
  loading: boolean;
  /** The already-resolved connection cards for this tab. */
  connected: ConnectionView[];
  /** Whether the mock "Load more" pool is offered (demo only — the live API
   *  paginates its own list, so it would splice in fake members otherwise). */
  allowMorePool?: boolean;
  isBlocked: (slug: string) => boolean;
  onUnblock: (v: ConnectionView) => void;
  onMessage: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("Recently connected");
  const [morePages, setMorePages] = useState(0);

  const revealedSlugs = useMemo(
    () => (allowMorePool ? MORE_POOL.slice(0, morePages * MORE_PER_PAGE) : []),
    [allowMorePool, morePages],
  );
  const hasMore = allowMorePool && revealedSlugs.length < MORE_POOL.length;

  const visibleAll = useMemo(() => {
    const seen = new Set(connected.map((v) => v.slug));
    const extra = connectionViews(revealedSlugs).filter(
      (v) => !seen.has(v.slug),
    );
    let views = [...connected, ...extra];
    const q = query.trim().toLowerCase();
    if (q) views = views.filter((v) => matchesView(v, q));
    if (sort === "A to Z") {
      views = [...views].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "Closest mutuals") {
      views = [...views].sort(
        (a, b) => (b.meta.mutuals ?? 0) - (a.meta.mutuals ?? 0),
      );
    }
    return views;
  }, [connected, revealedSlugs, query, sort]);

  return (
    <>
      <div className={styles.filters}>
        <SearchInput
          className={styles.searchInput}
          value={query}
          onChange={setQuery}
          placeholder="Search by name, role, or community"
          ariaLabel="Search connections"
        />
        <select
          className={styles.sortSel}
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
        >
          {SORTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <ConnectionsGridSkeleton count={6} />
      ) : (
        <>
          <div className={styles.grid}>
            {visibleAll.map((v, i) => (
              <FadeIn key={v.slug} delay={Math.min(i, 8) * 60}>
                <AllConnectionCard
                  view={v}
                  blocked={isBlocked(v.slug)}
                  onUnblock={() => onUnblock(v)}
                  onMessage={() => onMessage(v.slug)}
                />
              </FadeIn>
            ))}
          </div>
          {visibleAll.length === 0 &&
            (query.trim() === "" ? (
              <EmptyState
                compact
                icon={<FiUsers />}
                title="No connections yet"
                description="Your network starts with a single hello. Meet people at a gathering, or find members you already know and connect once you've met."
                action={{ label: "Find members", to: routes.members }}
              />
            ) : (
              <EmptyState
                compact
                icon={<FiSearch />}
                title="Nothing matches your search"
                description="No one in your network fits that search just yet. Clear it to see everyone again."
                action={{
                  label: "Clear search",
                  onClick: () => {
                    setQuery("");
                    setSort("Recently connected");
                  },
                }}
              />
            ))}
          {hasMore && query.trim() === "" && (
            <div className={styles.loadMore}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMorePages((p) => p + 1)}
              >
                Load more connections
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
