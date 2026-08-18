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

/** How long each board kind stays open before expiring, mirroring the
 *  backend's own server-side computation (`ProfilesService.replaceBoard`). */
const BOARD_EXPIRY_DAYS: Record<BoardItem["kind"], number> = {
  looking: 30,
  offering: 90,
};

/** A blank row for the "Add" button. `status`/`expiresAt`/`createdAt` are
 *  never edited here (see `BoardEditor`'s doc comment) — these are just
 *  plausible client-side stand-ins until the item round-trips through the
 *  backend's PUT, which recomputes them server-side. */
export function newBoardItem(kind: BoardItem["kind"] = "looking"): BoardItem {
  const createdAt = new Date();
  const expiresAt = new Date(
    createdAt.getTime() + BOARD_EXPIRY_DAYS[kind] * 24 * 60 * 60 * 1000,
  );
  return {
    kind,
    title: "",
    slug: "",
    status: "open",
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
