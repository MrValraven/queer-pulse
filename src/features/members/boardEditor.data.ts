import type { BoardItem } from "./data/members";

/**
 * The two sides of the barter board. `value` is the literal stored
 * `BoardItem.kind`; `labelKey` resolves through `t()` (namespace-prefixed,
 * like VISIBILITY_OPTIONS) and reuses the read-only section's own labels.
 */
export const BOARD_KIND_OPTIONS: ReadonlyArray<{
  value: BoardItem["kind"];
  labelKey: string;
}> = [
  { value: "looking", labelKey: "members:content.board.looking" },
  { value: "offering", labelKey: "members:content.board.offering" },
];
