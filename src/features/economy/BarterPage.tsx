import { useState } from "react";
import { FiRepeat } from "react-icons/fi";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  Outro,
  Reveal,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRINCIPLES, type Mode } from "./barter.data";
import type { BarterView } from "./api/barter.adapters";
import { useBarterListings } from "./api/useBarter";
import { BarterCard } from "./BarterCard";
import { BarterControls } from "./BarterControls";
import { BarterPostStrip } from "./BarterPostStrip";
import styles from "./BarterPage.module.css";

function BarterSkeleton() {
  return (
    <div className={styles.bc} aria-hidden>
      <div className={styles.bcHead}>
        <SkeletonAvatar size={40} />
        <div className={styles.bcMeta}>
          <SkeletonLine width="60%" height={14} />
          <SkeletonLine width="40%" height={12} style={{ marginTop: 5 }} />
        </div>
        <SkeletonLine width={68} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div className={`${styles.bcBlock} ${styles.bcOffer}`}>
        <SkeletonLine width={56} height={10} />
        <SkeletonLine width="75%" height={17} style={{ marginTop: 8 }} />
        <SkeletonLine width="95%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={`${styles.bcBlock} ${styles.bcWant}`}>
        <SkeletonLine width={64} height={10} />
        <SkeletonLine width="70%" height={17} style={{ marginTop: 8 }} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={styles.btags}>
        <SkeletonLine width={62} height={20} style={{ borderRadius: 6 }} />
        <SkeletonLine width={78} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div className={styles.bcFoot}>
        <SkeletonLine width={70} height={12} />
        <SkeletonLine width={110} height={13} />
      </div>
    </div>
  );
}

export function BarterPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const simulatedLoading = useSimulatedLoad();
  const [mode, setMode] = useState<"all" | Mode>("all");
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  // Demo-only: swaps posted in this session, prepended to the seeded board.
  // Live posts go to the API, and the board refetches instead.
  const [posted, setPosted] = useState<BarterView[]>([]);

  // One hook for both modes: demo filters the seeded fixtures in memory, live
  // asks the API with the same three controls, one page at a time.
  const listingsQuery = useBarterListings({ category: cat, mode, query });
  const board = listingsQuery.listings;
  const items = demoMode ? [...posted, ...board] : board;
  // A "Show more" fetch must not swap the whole grid for skeletons — only a
  // first load (or a filter change) does.
  const loading = demoMode
    ? simulatedLoading
    : listingsQuery.isFetching && !listingsQuery.isFetchingNextPage;
  // Live counts the whole board, not just the pages loaded so far, so the
  // number above the grid never shrinks to "what you can currently see".
  const total = demoMode ? items.length : listingsQuery.total;
  // Whether any control is narrowing the board — it decides which empty state
  // reads true: "nothing matches" versus "nothing posted yet".
  const hasFilters = mode !== "all" || cat !== "all" || query.trim() !== "";

  return (
    <PageShell>
      <header className={styles.hero} data-plum>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("economy:barter.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="economy:barter.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" delay={120}>
            {t("economy:barter.hero.lead")}
          </Reveal>
          <div className={styles.principle}>
            {PRINCIPLES.map((p, index) => (
              <Reveal
                key={p.id}
                className={styles.principleItem}
                delay={180 + index * 70}
              >
                <strong>{t(p.titleKey)}</strong>
                <span>{t(p.bodyKey)}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </header>

      <BarterControls
        query={query}
        onQueryChange={setQuery}
        mode={mode}
        onModeChange={setMode}
        category={cat}
        onCategoryChange={setCat}
        total={total}
      />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <BarterSkeleton key={i} />
              ))
            ) : (
              <>
                {listingsQuery.isError && (
                  <EmptyState
                    icon={<FiRepeat />}
                    title={t("economy:barter.errorLive.title")}
                    description={t("economy:barter.errorLive.description")}
                    action={{
                      label: t("economy:barter.errorLive.retry"),
                      onClick: () => void listingsQuery.refetch(),
                    }}
                  />
                )}
                {!listingsQuery.isError &&
                  items.length === 0 &&
                  (hasFilters ? (
                    <EmptyState
                      icon={<FiRepeat />}
                      title={t("economy:barter.empty.title")}
                      description={t("economy:barter.empty.description")}
                      action={{
                        label: t("economy:barter.empty.clearFilters"),
                        onClick: () => {
                          setMode("all");
                          setCat("all");
                          setQuery("");
                        },
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={<FiRepeat />}
                      title={t("economy:barter.emptyLive.title")}
                      description={t("economy:barter.emptyLive.description")}
                    />
                  ))}
                {items.map((b, index) => (
                  <FadeIn key={b.id} delay={Math.min(index, 8) * 60}>
                    <BarterCard barter={b} />
                  </FadeIn>
                ))}
              </>
            )}
          </div>

          {!loading && listingsQuery.hasNextPage && (
            <div className={styles.loadMoreRow}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void listingsQuery.fetchNextPage()}
                disabled={listingsQuery.isFetchingNextPage}
              >
                {t(
                  listingsQuery.isFetchingNextPage
                    ? "economy:barter.loadingMore"
                    : "economy:barter.loadMore",
                )}
              </Button>
            </div>
          )}

          <BarterPostStrip onPost={(b) => setPosted((prev) => [b, ...prev])} />
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="economy:barter.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:barter.outro.sub")}
      >
        <Button to={requestInvitePath("barter")} size="lg">
          {t("economy:barter.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
