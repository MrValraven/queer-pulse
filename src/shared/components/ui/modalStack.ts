import { useEffect, useId, useLayoutEffect, type RefObject } from "react";

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

/**
 * Dialog layers, bottom first, for `useInertWhileCovered` below. `Modal`,
 * `ModalSheet` and `SideSheet` register their scrim here, so with a confirm
 * open over a dialog, the dialog underneath leaves the tab order and the
 * accessibility tree and a screen-reader user reaches only the controls on
 * top. Kept apart from the Escape `stack` above, which also holds drawers and
 * palettes that register no layer and whose order stays exactly as it was.
 */
const coverableLayers: { layerId: string; element: HTMLElement }[] = [];

/** Every layer below the top one is inert, and the top one is interactive.
 *  The attribute goes straight to the DOM in the same tick as the change, so
 *  a closing dialog's focus return lands on a control that can take focus. */
function syncCoveredLayers(): void {
  coverableLayers.forEach(({ element }, layerIndex) => {
    element.toggleAttribute("inert", layerIndex < coverableLayers.length - 1);
  });
}

function addCoverableLayer(layerId: string, element: HTMLElement): void {
  if (coverableLayers.some((layer) => layer.layerId === layerId)) return;
  coverableLayers.push({ layerId, element });
  syncCoveredLayers();
}

function removeCoverableLayer(layerId: string): void {
  const layerIndex = coverableLayers.findIndex(
    (layer) => layer.layerId === layerId,
  );
  if (layerIndex === -1) return;
  const [removedLayer] = coverableLayers.splice(layerIndex, 1);
  removedLayer?.element.removeAttribute("inert");
  syncCoveredLayers();
}

/**
 * Keeps `layerRef`'s element inert while a later dialog layer is open above
 * it, and makes it interactive again the moment that layer starts closing or
 * unmounts. The order of the effects is what keeps focus working:
 * - The layer joins in a passive effect. Call this AFTER `useDismiss`, so a
 *   dialog opening over another has already taken focus before the one
 *   underneath goes inert.
 * - The layer leaves in a layout-effect cleanup. React runs those ahead of
 *   every passive cleanup and every new layout effect, so the dialog
 *   underneath is interactive again before `useDismiss` or `useFocusHandBack`
 *   returns focus to the control that opened the closing dialog.
 * - A dialog held open by `AnimatePresence` for its exit (`isClosing`) leaves
 *   the layers as the exit starts.
 */
export function useInertWhileCovered(
  layerRef: RefObject<HTMLElement | null>,
  isClosing: boolean,
): void {
  const layerId = useId();
  useEffect(() => {
    const layerElement = layerRef.current;
    if (isClosing || !layerElement) return;
    addCoverableLayer(layerId, layerElement);
  }, [layerId, layerRef, isClosing]);
  useLayoutEffect(
    () => () => removeCoverableLayer(layerId),
    [layerId, isClosing],
  );
}
