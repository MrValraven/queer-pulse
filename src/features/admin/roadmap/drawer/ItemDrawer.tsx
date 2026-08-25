import { useItemDrawer } from "../state/itemDrawerHook";
import { ItemDrawerBody } from "./ItemDrawerBody";

/**
 * The deep item-editing drawer (Commitment/Guide/Blocked/Dependencies/
 * Capacity/Visibility/Votes/Comments/Notes sections under `roadmap.drawer.*`
 * — see `ItemDrawerBody.tsx` for the real implementation). Consumes
 * `useItemDrawer()` directly so `AdminRoadmapPage` can mount `<ItemDrawer/>`
 * once, unconditionally, and every opener across the 9 views just calls
 * `open(id)`/`open("new")` without threading any state back up.
 *
 * `ItemDrawerBody` is only mounted while something is open, and keyed by
 * `openId` — switching from one item straight to another (or into/out of
 * create mode) fully remounts it, resetting local state (the create-mode
 * draft, the delete-confirm step, …) the same way `AdminDrawer`/`AdminModal`
 * elsewhere in this codebase are documented to expect ("mount only while
 * open" — see `ui/AdminDrawer.tsx`), rather than an effect trying to
 * re-sync it.
 */
export function ItemDrawer() {
  const { openId } = useItemDrawer();
  if (openId === null) return null;
  return <ItemDrawerBody key={openId} openId={openId} />;
}
