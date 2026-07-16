import { useMemo, useState } from "react";
import { Button, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import {
  COLLECTION_FILTER_LABEL_KEYS,
  collectionFilters,
  collections,
} from "./cinemaCollections.data";
import {
  CollectionCard,
  CollectionsHeader,
  CollectionsSkeleton,
  FeaturedCollection,
  ProposeCollection,
} from "./CinemaCollectionsSections";
import styles from "./CinemaCollectionsPage.module.css";

export function CinemaCollectionsPage() {
  const { t } = useTranslation();
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
            <span className={styles.sbLabel}>
              {t("cinema:collectionsIndex.filterLabel")}
            </span>
            {collectionFilters.map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.chip} ${active === f ? styles.chipOn : ""}`}
                aria-pressed={active === f}
                onClick={() => setActive(f)}
              >
                {t(COLLECTION_FILTER_LABEL_KEYS[f] ?? f)}
              </button>
            ))}
            <span className={styles.sbRight} aria-live="polite">
              {t("cinema:collectionsIndex.summary", {
                count: visible.length,
                filmTotal,
              })}
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
          <Translation
            i18nKey="cinema:collectionsIndex.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:collectionsIndex.outro.sub")}
      >
        <Button
          size="lg"
          to={`${routes.cinemaCollections}/${collections[0]!.slug}`}
        >
          {t("cinema:collectionsIndex.outro.cta")}
        </Button>
      </Outro>
    </CinemaShell>
  );
}

function FeaturedEmpty({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
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
        <Translation
          i18nKey="cinema:collectionsIndex.empty.title"
          components={{ em: <em /> }}
        />
      </p>
      <p
        style={{
          color: "rgba(var(--cream-rgb), 0.6)",
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        {t("cinema:collectionsIndex.empty.body")}
      </p>
      <Button variant="ghost-dark" onClick={onReset}>
        {t("cinema:collectionsIndex.empty.resetCta")}
      </Button>
    </div>
  );
}
