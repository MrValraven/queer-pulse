import { useEffect, useRef, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  AdminRoadmapItemDTO,
  RoadmapColumn,
} from "../../api/roadmapAdmin.types";
import type { CardMoveProps } from "./useBoardDnd";
import styles from "./CardMenu.module.css";

const COLUMN_ORDER: RoadmapColumn[] = [
  "backlog",
  "planned",
  "building",
  "shipped",
];

interface CardMenuProps {
  item: AdminRoadmapItemDTO;
  ariaLabel: string;
  moveProps: CardMoveProps;
  onMoveTo: (column: RoadmapColumn) => void;
  onEdit: () => void;
  onTogglePublic: () => void;
  onDuplicate: () => void;
  onNotifyVoters: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

/**
 * Board card kebab (`admin:roadmap.board.menu.*`) — reorder within the
 * column / move to another column / edit / toggle public / duplicate /
 * notify voters / archive / delete. The APG menu-button pattern, mirroring
 * `ListingModerationActions`' own `OverflowMenu`: outside-click + Escape
 * close, first item focused on open. Purely presentational — every action is
 * a callback the caller (the card) owns; this component knows nothing about
 * mutations.
 *
 * "Move up"/"Move down" are the keyboard half of the board's drag reorder,
 * shaped like the magazine desk's running order (one step at a time, named
 * with the card, unavailable at the ends of the column). They live in this
 * menu rather than as a pair of buttons on the card because the card head row
 * already carries a checkbox, grip, two chips, the flag strip and this
 * trigger, and shrinks again in dense mode — two more controls per card would
 * crowd it and add two tab stops to every card across four columns. The kebab
 * is already where "move" lives.
 *
 * Two deliberate departures from the rest of the menu, both so a keyboard
 * editor can step a card several slots without re-opening anything:
 * activating a move does NOT close the menu (focus stays on the pressed
 * item, so repeating is one key), and the pair is rendered as long as the
 * column can be reordered at all, with the unavailable direction
 * `aria-disabled` rather than dropped — an item that unmounted under the
 * focus sitting on it would drop that focus to the body.
 */
export function CardMenu({
  item,
  ariaLabel,
  moveProps,
  onMoveTo,
  onEdit,
  onTogglePublic,
  onDuplicate,
  onNotifyVoters,
  onArchive,
  onDelete,
}: CardMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Queried rather than held on a ref, because which item comes first now
    // depends on whether this column can be reordered at all.
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function runAndClose(action: () => void) {
    setOpen(false);
    action();
  }

  const moveTargets = COLUMN_ORDER.filter((column) => column !== item.column);
  const canReorder = moveProps.canMoveUp || moveProps.canMoveDown;

  return (
    <div className={styles.wrap} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <FiMoreVertical aria-hidden />
      </button>

      {open && (
        <div className={styles.menu} role="menu" ref={menuRef}>
          {canReorder && (
            <>
              <button
                type="button"
                role="menuitem"
                className={styles.item}
                aria-disabled={!moveProps.canMoveUp}
                aria-label={t("admin:roadmap.board.menu.moveUpAriaLabel", {
                  name: item.name,
                })}
                onClick={() => {
                  if (moveProps.canMoveUp) moveProps.moveUp();
                }}
              >
                {t("admin:roadmap.board.menu.moveUp")}
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.item}
                aria-disabled={!moveProps.canMoveDown}
                aria-label={t("admin:roadmap.board.menu.moveDownAriaLabel", {
                  name: item.name,
                })}
                onClick={() => {
                  if (moveProps.canMoveDown) moveProps.moveDown();
                }}
              >
                {t("admin:roadmap.board.menu.moveDown")}
              </button>
            </>
          )}
          {moveTargets.map((column) => (
            <button
              key={column}
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => runAndClose(() => onMoveTo(column))}
            >
              {t("admin:roadmap.board.menu.moveTo", {
                column: t(`admin:roadmap.board.column.${column}`),
              })}
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => runAndClose(onEdit)}
          >
            {t("admin:roadmap.board.menu.editDetails")}
          </button>
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => runAndClose(onTogglePublic)}
          >
            {t(
              item.isPublic
                ? "admin:roadmap.board.menu.hidePublic"
                : "admin:roadmap.board.menu.showPublic",
            )}
          </button>
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => runAndClose(onDuplicate)}
          >
            {t("admin:roadmap.board.menu.duplicate")}
          </button>
          {item.votes > 0 && (
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => runAndClose(onNotifyVoters)}
            >
              {t("admin:roadmap.board.menu.notifyVoters", {
                count: item.votes,
              })}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => runAndClose(onArchive)}
          >
            {t("admin:roadmap.board.menu.archive")}
          </button>
          <button
            type="button"
            role="menuitem"
            className={[styles.item, styles.itemDanger].join(" ")}
            onClick={() => runAndClose(onDelete)}
          >
            {t("admin:common.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
