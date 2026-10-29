import type { MusicEventListResult } from "./api/useMusicEvents";

/** Which of the list's four views is on screen; `none` is the instant between
 *  a failed first page and its error view being allowed to show. */
export type MusicEventListViewName =
  "loading" | "error" | "empty" | "rows" | "none";

/** Names the view the list shows for its current state. */
export function musicEventListViewName(
  list: MusicEventListResult,
): MusicEventListViewName {
  if (list.isLoading) return "loading";
  if (list.isLoadError) return list.errorUpdateCount > 0 ? "error" : "none";
  return list.rows.length > 0 ? "rows" : "empty";
}
