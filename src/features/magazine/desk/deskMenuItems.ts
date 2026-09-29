import type { ReactNode } from "react";

/** A command. `tone: "danger"` paints it in the danger colour (Delete). */
export interface DeskMenuActionItem {
  kind: "action";
  id: string;
  label: string;
  /** A second, muted line under the label ("Issue 12 · 7 of 12 slots"). */
  description?: string;
  icon?: ReactNode;
  /** Display text for a keyboard shortcut ("N"). Visual only: whoever owns
   *  the shortcut binds it; the menu just shows the hint. */
  shortcut?: string;
  onSelect: () => void;
  isDisabled?: boolean;
  tone?: "default" | "danger";
}

/** One choice of several (Sort by, the scope switcher). */
export interface DeskMenuRadioItem {
  kind: "radio";
  id: string;
  label: string;
  description?: string;
  isChecked: boolean;
  onSelect: () => void;
}

/** An independent toggle (a filter). Keeps the menu open by default. */
export interface DeskMenuCheckboxItem {
  kind: "checkbox";
  id: string;
  label: string;
  description?: string;
  isChecked: boolean;
  onSelect: () => void;
}

export interface DeskMenuSeparatorItem {
  kind: "separator";
  id: string;
}

/** Labels the items that follow it, up to the next separator or heading. */
export interface DeskMenuHeadingItem {
  kind: "heading";
  id: string;
  label: string;
}

export type DeskMenuItem =
  | DeskMenuActionItem
  | DeskMenuRadioItem
  | DeskMenuCheckboxItem
  | DeskMenuSeparatorItem
  | DeskMenuHeadingItem;

/** The items a member can focus and choose. */
export type DeskMenuSelectableItem =
  DeskMenuActionItem | DeskMenuRadioItem | DeskMenuCheckboxItem;

export function isSelectableItem(
  item: DeskMenuItem,
): item is DeskMenuSelectableItem {
  return (
    item.kind === "action" || item.kind === "radio" || item.kind === "checkbox"
  );
}

/** Whether keyboard focus may land on this item. Disabled actions are skipped
 *  so arrow keys and type-ahead only ever stop on something that works. */
export function isNavigableItem(
  item: DeskMenuItem,
): item is DeskMenuSelectableItem {
  if (!isSelectableItem(item)) return false;
  return !(item.kind === "action" && item.isDisabled);
}

/**
 * Whether choosing `item` closes the menu. An explicit `shouldCloseOnSelect`
 * wins for every item; left unset, a checkbox keeps the menu open (a member
 * ticks several filters in one visit) and every other kind closes it.
 */
export function shouldItemCloseMenu(
  item: DeskMenuSelectableItem,
  shouldCloseOnSelect: boolean | undefined,
): boolean {
  if (shouldCloseOnSelect !== undefined) return shouldCloseOnSelect;
  return item.kind !== "checkbox";
}

/** A selectable item with its position in the flat `items` array, which is
 *  what the keyboard hook and the item refs are indexed by. */
export interface DeskMenuEntry {
  item: DeskMenuSelectableItem;
  index: number;
}

export type DeskMenuBlock =
  | { kind: "separator"; item: DeskMenuSeparatorItem }
  | {
      kind: "group";
      key: string;
      heading: DeskMenuHeadingItem | null;
      entries: DeskMenuEntry[];
    };

/**
 * Splits the flat item list into what the DOM needs: a heading opens a
 * `role="group"` labelled by it, which runs until the next separator or
 * heading. Items before any heading form an unlabelled run rendered straight
 * into the menu.
 */
export function groupDeskMenuItems(items: DeskMenuItem[]): DeskMenuBlock[] {
  const blocks: DeskMenuBlock[] = [];
  let currentGroup: Extract<DeskMenuBlock, { kind: "group" }> | null = null;
  for (const [index, item] of items.entries()) {
    if (item.kind === "separator") {
      blocks.push({ kind: "separator", item });
      currentGroup = null;
      continue;
    }
    if (item.kind === "heading" || currentGroup === null) {
      currentGroup = {
        kind: "group",
        key: item.id,
        heading: item.kind === "heading" ? item : null,
        entries: [],
      };
      blocks.push(currentGroup);
    }
    if (isSelectableItem(item)) currentGroup.entries.push({ item, index });
  }
  return blocks;
}
