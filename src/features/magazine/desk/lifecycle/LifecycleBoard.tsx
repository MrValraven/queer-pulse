import { EmptyState, SkeletonLine } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  ArticleLifecycleRecordDTO,
  LifecycleCountsDTO,
} from "../../api/lifecycle.api";
import { LifecycleRow } from "./LifecycleRow";
import styles from "./LifecycleBoard.module.css";

export interface LifecycleCountsBarProps {
  counts: LifecycleCountsDTO | undefined;
}

/**
 * CON-16 — the standing tally of the archive. `overdue` sits apart from the
 * four states because it is the only figure that is a debt: pieces the desk
 * promised to re-check and has not.
 */
export function LifecycleCountsBar({ counts }: LifecycleCountsBarProps) {
  const { t } = useTranslation();
  if (!counts) return null;

  const tiles: { key: string; labelKey: string; value: number }[] = [
    {
      key: "live",
      labelKey: "magazine:lifecycle.state.live",
      value: counts.live,
    },
    {
      key: "under_review",
      labelKey: "magazine:lifecycle.state.underReview",
      value: counts.underReview,
    },
    {
      key: "archived",
      labelKey: "magazine:lifecycle.state.archived",
      value: counts.archived,
    },
    {
      key: "superseded",
      labelKey: "magazine:lifecycle.state.superseded",
      value: counts.superseded,
    },
  ];

  return (
    <div className={styles.counts}>
      {tiles.map((tile) => (
        <div className={styles.countTile} key={tile.key}>
          <b>{tile.value}</b>
          <span>{t(tile.labelKey)}</span>
        </div>
      ))}
      <div
        className={`${styles.countTile} ${counts.overdue > 0 ? styles.countOverdue : ""}`.trim()}
      >
        <b>{counts.overdue}</b>
        <span>{t("magazine:lifecycle.counts.overdue")}</span>
      </div>
    </div>
  );
}

export interface LifecycleListProps {
  headingKey: string;
  blurbKey: string;
  emptyKey: string;
  records: ArticleLifecycleRecordDTO[];
  isLoading: boolean;
  onEdit?: (record: ArticleLifecycleRecordDTO) => void;
  onLanguages?: (record: ArticleLifecycleRecordDTO) => void;
}

/**
 * CON-16 — one of the board's two lists. They are separate because they
 * answer different questions: the review queue is work the desk owes, and the
 * flagged list is what a reader currently sees a banner on. A piece can sit in
 * both, which is exactly the case worth noticing.
 */
export function LifecycleList({
  headingKey,
  blurbKey,
  emptyKey,
  records,
  isLoading,
  onEdit,
  onLanguages,
}: LifecycleListProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelHeading}>{t(headingKey)}</h2>
      <p className={styles.panelBlurb}>{t(blurbKey)}</p>
      {isLoading ? (
        <div className={styles.loading}>
          <SkeletonLine width="70%" />
          <SkeletonLine width="55%" />
          <SkeletonLine width="62%" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState title={t(emptyKey)} />
      ) : (
        <ul className={styles.list}>
          {records.map((record) => (
            <LifecycleRow
              key={record.articleId}
              record={record}
              onEdit={onEdit}
              onLanguages={onLanguages}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
