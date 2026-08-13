/**
 * Module-level stack of currently-mounted dialog ids, topmost (most recently
 * mounted) last. Backs the "only the topmost dialog responds to Escape"
 * behavior shared by `Modal`/`ModalSheet` (this file's siblings) and
 * `AdminModal` (`features/admin/ui/AdminModal.tsx`).
 *
 * Without this, two stacked dialogs — e.g. a confirm dialog opened from a
 * button inside another dialog's footer — each register their own
 * document-level `keydown` listener with no notion of the other, so a single
 * Escape press closes BOTH instead of just the one on top. A lone dialog is
 * always alone on the stack, so it's always topmost and closes exactly as
 * before.
 */
const stack: string[] = [];

/** Push a dialog's id onto the stack when it mounts. */
export function pushModal(id: string): void {
  stack.push(id);
}

/** Pop a dialog's id off the stack when it unmounts. */
export function popModal(id: string): void {
  const index = stack.lastIndexOf(id);
  if (index !== -1) stack.splice(index, 1);
}

/** Whether `id` is currently the topmost (most-recently-mounted) dialog. */
export function isTopmostModal(id: string): boolean {
  return stack.length > 0 && stack[stack.length - 1] === id;
}

/** Whether ANY dialog is currently mounted, regardless of which one. For a
 *  page-scoped keyboard shortcut layer (e.g. the admin Review-queue's J/K/A/R
 *  flow) that needs to go inert the moment ANY modal/drawer/confirm-dialog
 *  opens above it — including one it doesn't itself track state for, like a
 *  `ConfirmDialog` mounted by a child component — rather than re-deriving
 *  that from a handful of local "is this specific dialog open" booleans. */
export function hasOpenModal(): boolean {
  return stack.length > 0;
}
