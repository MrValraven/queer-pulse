import { Link } from "react-router-dom";
import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SetupChecklistItem } from "./communitySetupChecklist.model";
import {
  SETUP_CHECKLIST_CO_STEWARD_WAITING_KEY,
  SETUP_CHECKLIST_ITEM_COPY,
} from "./communitySetupChecklist.data";
import type { EditCommunityFocusField } from "./editCommunityFocusField";
import styles from "./CommunitySetupChecklist.module.css";

/**
 * One row of the setup checklist. An open item names its action in its
 * title: a button that opens the edit modal at the field, or a link into Mod
 * tools or the composer. A done item stays listed, ticked and quieter, as
 * plain text, since there is nothing left to do on it.
 */
export function CommunitySetupChecklistItem({
  item,
  onOpenEditAt,
}: {
  item: SetupChecklistItem;
  onOpenEditAt: (field: EditCommunityFocusField) => void;
}) {
  const { t } = useTranslation();
  const copy = SETUP_CHECKLIST_ITEM_COPY[item.id];
  const title = t(copy.titleKey);
  const body = t(
    item.isWaitingForMembers
      ? SETUP_CHECKLIST_CO_STEWARD_WAITING_KEY
      : copy.bodyKey,
  );
  const statusLabel = t(
    item.isDone
      ? "communities:detail.setupChecklist.status.done"
      : "communities:detail.setupChecklist.status.open",
  );
  const rowClassName = [styles.item, item.isDone && styles.itemDone]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={rowClassName}>
      <span className={styles.itemIcon} aria-hidden>
        {item.isDone ? <FiCheckCircle /> : <FiCircle />}
      </span>
      <div className={styles.itemText}>
        <span className="visuallyHidden">{statusLabel}</span>
        <ItemTitle item={item} title={title} onOpenEditAt={onOpenEditAt} />
        <p className={styles.itemBody}>{body}</p>
      </div>
    </li>
  );
}

/** The title of a row: the action itself while the item is open, plain text
 *  once it is done. */
function ItemTitle({
  item,
  title,
  onOpenEditAt,
}: {
  item: SetupChecklistItem;
  title: string;
  onOpenEditAt: (field: EditCommunityFocusField) => void;
}) {
  const { action } = item;
  if (!item.isDone && action.kind === "edit") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={styles.itemAction}
        onClick={() => onOpenEditAt(action.field)}
      >
        {title}
      </Button>
    );
  }
  if (!item.isDone && action.kind === "link") {
    return (
      <Link to={action.to} className={styles.itemAction}>
        {title}
      </Link>
    );
  }
  return <span className={styles.itemTitle}>{title}</span>;
}
