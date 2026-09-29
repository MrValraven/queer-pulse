import { Fragment, useEffect, useId, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { DeskMenuItemButton } from "./DeskMenuItemButton";
import {
  groupDeskMenuItems,
  shouldItemCloseMenu,
  type DeskMenuEntry,
  type DeskMenuItem,
  type DeskMenuSelectableItem,
} from "./deskMenuItems";
import { useDeskMenuKeyboard } from "./useDeskMenuKeyboard";
import { useDeskMenuPlacement } from "./useDeskMenuPlacement";
import styles from "./DeskMenu.module.css";

export interface DeskMenuListProps {
  menuId: string;
  items: DeskMenuItem[];
  label: string;
  align: "start" | "end";
  minWidth: "trigger" | "sm" | "md";
  /** Which end focus lands on when the menu opens (ArrowUp opens on the last). */
  initialFocus: "first" | "last";
  shouldCloseOnSelect: boolean | undefined;
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** `true` hands focus back to the trigger (Escape, Tab, a chosen item). */
  onClose: (shouldRestoreFocus: boolean) => void;
}

/**
 * The open half of `DeskMenu`, portaled to `<body>` and mounted only while
 * open, so every open measures fresh and starts with an empty type-ahead.
 *
 * The first commit renders transparent at the viewport corner; placement lands
 * in a layout effect before paint, and focus waits for it so it never lands on
 * an unplaced menu (same order as `PieceRowMenuPopover`).
 */
export function DeskMenuList({
  menuId,
  items,
  label,
  align,
  minWidth,
  initialFocus,
  shouldCloseOnSelect,
  triggerRef,
  onClose,
}: DeskMenuListProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headingIdPrefix = useId();
  const placement = useDeskMenuPlacement(
    triggerRef,
    menuRef,
    align,
    minWidth === "trigger",
  );
  const { handleKeyDown, focusFrom } = useDeskMenuKeyboard({
    items,
    itemRefs,
    onClose,
  });
  const isPlaced = placement !== null;

  // Read through a ref so the listener below subscribes once per open, and a
  // parent re-render (a checkbox toggled) never re-attaches it.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Focus enters the menu once it is placed. Keyed on `isPlaced`, so a later
  // re-placement on scroll never yanks focus back to the first item.
  useEffect(() => {
    if (!isPlaced) return;
    const didFocusItem =
      initialFocus === "last"
        ? focusFrom(items.length - 1, -1)
        : focusFrom(0, 1);
    // Nothing to focus (every action disabled): focus the menu itself, so its
    // Escape and Tab handling still applies.
    if (!didFocusItem) menuRef.current?.focus();
    // Only the first placement moves focus; see above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaced]);

  // An outside press closes without stealing focus back: the member is already
  // putting it somewhere else. A press on the trigger is not outside, or it
  // would close here and reopen in the trigger's own click handler.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent): void {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onCloseRef.current(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [triggerRef]);

  // Focus goes back to the trigger BEFORE `onSelect` runs, so a dialog the
  // item opens records the trigger as the place to return focus to on close.
  function handleSelect(item: DeskMenuSelectableItem): void {
    if (shouldItemCloseMenu(item, shouldCloseOnSelect)) onClose(true);
    item.onSelect();
  }

  function renderEntry({ item, index }: DeskMenuEntry) {
    return (
      <DeskMenuItemButton
        key={item.id}
        item={item}
        itemRef={(node) => {
          itemRefs.current[index] = node;
        }}
        onSelect={handleSelect}
      />
    );
  }

  const widthClassName =
    minWidth === "md" ? styles.menuMd : minWidth === "sm" ? styles.menuSm : "";

  return createPortal(
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      className={`${styles.menu} ${widthClassName}`}
      data-placed={isPlaced || undefined}
      style={{
        top: placement?.top ?? 0,
        left: placement?.left ?? 0,
        minWidth:
          minWidth === "trigger" ? (placement?.triggerWidth ?? 0) : undefined,
      }}
      onKeyDown={handleKeyDown}
      // Portals bubble React events through the React tree, so a click here
      // would also reach whatever wraps the trigger (a clickable row).
      onClick={(event) => event.stopPropagation()}
    >
      {groupDeskMenuItems(items).map((block) => {
        if (block.kind === "separator") {
          return (
            <div
              key={block.item.id}
              role="separator"
              className={styles.separator}
            />
          );
        }
        if (block.heading === null) {
          return (
            <Fragment key={block.key}>
              {block.entries.map(renderEntry)}
            </Fragment>
          );
        }
        const headingId = `${headingIdPrefix}-${block.heading.id}`;
        return (
          <div key={block.key} role="group" aria-labelledby={headingId}>
            <div id={headingId} role="presentation" className={styles.heading}>
              {block.heading.label}
            </div>
            {block.entries.map(renderEntry)}
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
