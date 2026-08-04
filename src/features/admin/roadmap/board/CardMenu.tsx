import { useEffect, useRef, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminRoadmapItemDTO, RoadmapColumn } from "../../api/roadmapAdmin.types";
import styles from "./CardMenu.module.css";

const COLUMN_ORDER: RoadmapColumn[] = ["backlog", "planned", "building", "shipped"];

interface CardMenuProps {
  item: AdminRoadmapItemDTO;
  ariaLabel: string;
  onMoveTo: (column: RoadmapColumn) => void;
  onEdit: () => void;
  onTogglePublic: () => void;
  onDuplicate: () => void;
  onNotifyVoters: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

/**
 * Board card kebab (`admin:roadmap.board.menu.*`) — move / edit / toggle
 * public / duplicate / notify voters / archive / delete. The APG
 * menu-button pattern, mirroring `ListingModerationActions`' own
 * `OverflowMenu`: outside-click + Escape close, first item focused on open.
 * Purely presentational — every action is a callback the caller (the card)
 * owns; this component knows nothing about mutations.
 */
export function CardMenu({
  item,
  ariaLabel,
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
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
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
        <div className={styles.menu} role="menu">
          {moveTargets.map((column, index) => (
            <button
              key={column}
              ref={index === 0 ? firstItemRef : undefined}
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
              {t("admin:roadmap.board.menu.notifyVoters", { count: item.votes })}
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
