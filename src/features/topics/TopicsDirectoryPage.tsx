import { useMemo, useState } from "react";
import { FiHash } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  EmptyState,
  LoadErrorState,
  SearchInput,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useTopics } from "./api/useTopics";
import { TopicCard } from "./TopicCard";
import styles from "./TopicsDirectoryPage.module.css";

function TopicCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width={28} height={28} style={{ borderRadius: "50%" }} />
      <SkeletonLine width="50%" height={20} style={{ marginTop: 12 }} />
      <SkeletonLine width="100%" height={14} style={{ marginTop: 8 }} />
      <SkeletonLine width="80%" height={14} style={{ marginTop: 6 }} />
      <div className={styles.cardFoot}>
        <SkeletonLine width={70} height={13} />
        <SkeletonLine width={84} height={32} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}

/**
 * DISC-4 — the topics directory: every topic, searchable, with a follow
 * toggle on each card. Mirrors `CommunitiesDiscover`'s directory-page layout
 * (search row + responsive card grid + skeleton/empty states,
 * `features/communities/CommunitiesPage.tsx`) since topics are the same
 * shape of problem — a flat, followable directory — just without server-side
 * pagination (`GET /topics` already returns the full list in one call).
 */
export function TopicsDirectoryPage() {
  const { t } = useTranslation();
  const { items: topics, isLoading, isError, refetch } = useTopics();
  const [searchInput, setSearchInput] = useState("");

  const visible = useMemo(() => {
    const needle = searchInput.trim().toLowerCase();
    if (!needle) return topics;
    return topics.filter(
      (topic) =>
        topic.tag.toLowerCase().includes(needle) ||
        topic.label.toLowerCase().includes(needle) ||
        topic.description.toLowerCase().includes(needle),
    );
  }, [topics, searchInput]);

  return (
    <PageShell>
      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eyebrow}>
              {t("topics:directory.eyebrow")}
            </div>
            <h1 className={styles.h1}>{t("topics:directory.title")}</h1>
            <p className={styles.sub}>{t("topics:directory.sub")}</p>
          </div>

          <SearchInput
            className={styles.search}
            value={searchInput}
            onChange={setSearchInput}
            placeholder={t("topics:directory.search.placeholder")}
            ariaLabel={t("topics:directory.search.ariaLabel")}
          />

          {isError ? (
            /* A failed directory is not an empty directory: "no topics yet"
               would send someone away from a place that is full. */
            <LoadErrorState
              onRetry={refetch}
              title={
                <Translation
                  i18nKey="topics:directory.loadError.title"
                  components={{ em: <em /> }}
                />
              }
              description={t("topics:directory.loadError.body")}
            />
          ) : !isLoading && visible.length === 0 ? (
            searchInput ? (
              <EmptyState
                icon={<FiHash />}
                title={t("topics:directory.empty.search.title")}
                description={t("topics:directory.empty.search.description")}
                action={{
                  label: t("topics:directory.empty.search.cta"),
                  onClick: () => setSearchInput(""),
                }}
              />
            ) : (
              <EmptyState
                icon={<FiHash />}
                title={t("topics:directory.empty.none.title")}
                description={t("topics:directory.empty.none.description")}
              />
            )
          ) : (
            <div className={styles.grid}>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <TopicCardSkeleton key={index} />
                  ))
                : visible.map((topic) => (
                    <TopicCard key={topic.tag} topic={topic} />
                  ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
