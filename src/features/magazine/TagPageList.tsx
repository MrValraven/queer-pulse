import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { ALL_ITEMS, CHIPS, PAGE_SIZE } from "./tag.data";
import styles from "./TagPage.module.css";

const ARTICLE = routes.article;
const NEWSLETTER = routes.newsletter;

function ItemSkeleton() {
  // Mirrors the real .item: kicker line, two-line title, dek, byline.
  return (
    <div className={styles.item} aria-hidden>
      <SkeletonLine width={140} height={11} />
      <SkeletonLine width="85%" height={24} style={{ marginTop: 4 }} />
      <SkeletonLine width="60%" height={24} />
      <SkeletonLine width="95%" height={14} style={{ marginTop: 4 }} />
      <SkeletonLine width="40%" height={12.5} style={{ marginTop: 4 }} />
    </div>
  );
}

export function TagPageList({
  loading,
  activeChip,
  onResetChip,
}: {
  loading: boolean;
  activeChip: number;
  onResetChip: () => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisible((v) => v + PAGE_SIZE);
      setLoadingMore(false);
    }, 600);
  };

  const matched = useMemo(() => {
    if (activeChip === 0) return ALL_ITEMS;
    const topic = CHIPS[activeChip]!;
    return ALL_ITEMS.filter((it) => it.topics.includes(topic));
  }, [activeChip]);

  const filtered = matched.slice(0, visible);
  const remaining = matched.length - filtered.length;

  return (
    <>
      {loading ? (
        <section className={styles.list}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </section>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiFileText />}
          title="No long reads in this category yet"
          description={
            <>
              Nothing filed under <em>{CHIPS[activeChip]}</em> in long reads so
              far. Browse every piece, or get the next one by email.
            </>
          }
          action={{
            label: "Show all long reads",
            onClick: () => {
              onResetChip();
              setVisible(PAGE_SIZE);
            },
          }}
          secondaryAction={{
            label: "Get long reads by email →",
            to: NEWSLETTER,
          }}
        />
      ) : (
        <section className={styles.list}>
          {filtered.map((it, i) => (
            <FadeIn
              as={Link}
              to={ARTICLE}
              className={styles.item}
              key={i}
              delay={Math.min(i % PAGE_SIZE, 8) * 60}
            >
              <div className={styles.itemKicker}>
                {it.kicker} <span className={styles.read}>{it.read}</span>
              </div>
              <h3 className={styles.itemH}>{it.title}</h3>
              <p className={styles.itemDek}>{it.dek}</p>
              <div className={styles.itemByline}>{it.byline}</div>
            </FadeIn>
          ))}
          {loadingMore &&
            Array.from({ length: Math.min(PAGE_SIZE, remaining) }).map(
              (_, i) => <ItemSkeleton key={`more-${i}`} />,
            )}
        </section>
      )}

      {!loading && remaining > 0 && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            onClick={loadMore}
            disabled={loadingMore}
            aria-busy={loadingMore}
          >
            {loadingMore
              ? "Loading older long reads…"
              : `Load ${Math.min(PAGE_SIZE, remaining)} older long reads`}
          </Button>
        </div>
      )}
    </>
  );
}
