import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { Badge, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminRoadmapItem } from "./adminRoadmap.data";
import styles from "./AdminRoadmapPage.module.css";

/** Column-relevant meta line: a shipped date, the building stage/eta/progress
 *  trio, or the planned vote count (with live votes called out separately
 *  from the seeded starting count). */
function ItemMeta({ item }: { item: AdminRoadmapItem }) {
  const { t } = useTranslation();

  if (item.column === "shipped") {
    return item.date ? <span className={styles.itemMeta}>{item.date}</span> : null;
  }

  if (item.column === "building") {
    const parts = [
      item.stage,
      item.eta ? t("admin:roadmap.board.item.etaLabel", { eta: item.eta }) : null,
      item.progress !== null
        ? t("admin:roadmap.board.item.progressLabel", { progress: item.progress })
        : null,
    ].filter(Boolean);
    return parts.length > 0 ? (
      <span className={styles.itemMeta}>{parts.join(" · ")}</span>
    ) : null;
  }

  return (
    <span className={styles.itemMeta}>
      {t("admin:roadmap.board.item.votesLabel", { votes: item.votes })}
      {item.liveVotes !== item.votes &&
        ` (${t("admin:roadmap.board.item.liveVotesLabel", { count: item.liveVotes })})`}
    </span>
  );
}

/**
 * One kanban card: name/category, its column-relevant meta, requested/hot
 * tags, and the edit/delete/reorder actions. Reordering is column-local —
 * `onMoveUp`/`onMoveDown` are only rendered enabled when a neighbor exists
 * in this item's own column (the board computes `canMoveUp`/`canMoveDown`).
 */
export function AdminRoadmapItemRow({
  item,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: AdminRoadmapItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { t } = useTranslation();
  const showRequestedTag = item.column !== "planned" && item.requested;

  return (
    <li className={styles.itemRow}>
      <div className={styles.itemReorder}>
        <Button
          variant="ghost"
          size="md"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          aria-label={t("admin:roadmap.board.item.moveUpAriaLabel", {
            name: item.name,
          })}
        >
          <FiChevronUp size={16} />
        </Button>
        <Button
          variant="ghost"
          size="md"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          aria-label={t("admin:roadmap.board.item.moveDownAriaLabel", {
            name: item.name,
          })}
        >
          <FiChevronDown size={16} />
        </Button>
      </div>

      <div className={styles.itemMain}>
        <div className={styles.itemTop}>
          <span className={styles.itemName}>{item.name}</span>
          <span className={styles.itemCategory}>{item.category}</span>
        </div>
        <ItemMeta item={item} />
        {(showRequestedTag || item.hot) && (
          <div className={styles.itemTags}>
            {showRequestedTag && (
              <Badge tone="ghost">
                {t("admin:roadmap.board.item.requestedTag")}
              </Badge>
            )}
            {item.hot && (
              <Badge tone="coral">{t("admin:roadmap.board.item.hotTag")}</Badge>
            )}
          </div>
        )}
      </div>

      <div className={styles.itemActions}>
        <Button variant="ghost" size="md" onClick={onEdit}>
          {t("admin:common.edit")}
        </Button>
        <Button variant="ghost" size="md" onClick={onDelete}>
          {t("admin:common.delete")}
        </Button>
      </div>
    </li>
  );
}
