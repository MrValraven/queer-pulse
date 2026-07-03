import { useMemo, useState } from "react";
import { Button, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import { collectionFilters, collections } from "./cinemaCollections.data";
import {
  CollectionCard,
  CollectionsHeader,
  CollectionsSkeleton,
  FeaturedCollection,
  ProposeCollection,
} from "./CinemaCollectionsSections";
import styles from "./CinemaCollectionsPage.module.css";

export function CinemaCollectionsPage() {
  const loading = useSimulatedLoad();
  const [active, setActive] = useState("All");

  const visible = useMemo(
    () =>
      active === "All"
        ? collections
        : collections.filter((c) => c.filters.includes(active)),
    [active],
  );

  const [featured, ...rest] = visible;
  const filmTotal = visible.reduce((sum, c) => sum + c.filmCount, 0);

  return (
    <CinemaShell>
      <CollectionsHeader />

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.sortBar}>
            <span className={styles.sbLabel}>Filter:</span>
            {collectionFilters.map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.chip} ${active === f ? styles.chipOn : ""}`}
                aria-pressed={active === f}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
            <span className={styles.sbRight} aria-live="polite">
              {visible.length}{" "}
              {visible.length === 1 ? "collection" : "collections"} ·{" "}
              {filmTotal} films total
            </span>
          </div>

          {loading ? (
            <CollectionsSkeleton />
          ) : featured ? (
            <>
              <FadeIn>
                <FeaturedCollection c={featured} />
              </FadeIn>
              <div className={styles.grid}>
                {rest.map((c, i) => (
                  <FadeIn key={c.slug} delay={Math.min(i + 1, 8) * 60}>
                    <CollectionCard c={c} />
                  </FadeIn>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <FeaturedEmpty onReset={() => setActive("All")} />
            </div>
          )}

          <ProposeCollection />
        </div>
      </section>

      <Outro
        title={
          <>
            Start <em>wandering</em>.
          </>
        }
        sub="Collections are how we argue about film. Pick one and begin."
      >
        <Button
          size="lg"
          to={`${routes.cinemaCollections}/${collections[0]!.slug}`}
        >
          Open a collection →
        </Button>
      </Outro>
    </CinemaShell>
  );
}

function FeaturedEmpty({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <p
        style={{
          fontFamily: "var(--serif)",
          fontSize: 22,
          color: "var(--cream)",
          marginBottom: 8,
        }}
      >
        No collections in this filter <em>yet</em>.
      </p>
      <p
        style={{
          color: "rgba(var(--cream-rgb), 0.6)",
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        The council is always building. Try another lens.
      </p>
      <Button variant="ghost-dark" onClick={onReset}>
        Show all collections
      </Button>
    </div>
  );
}
