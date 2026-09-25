// ── Where the category grid's recent-threads popover sits ───────────────────
// Kept apart from `ComposeCategoryPopover` so that file exports only its
// component (fast refresh needs that).

/** Width of the popover, in px. Mirrored in the stylesheet; kept here so the
 *  left-edge clamp can keep it inside the grid. */
const POPOVER_WIDTH = 250;

/** Gap between a card's bottom edge and the popover under it, in px. */
const POPOVER_OFFSET = 6;

/** Where the popover sits under `card`, measured from `gridWrap`, clamped so
 *  it never runs past the grid's right edge. */
export function measurePopoverPosition(
  card: HTMLElement,
  gridWrap: HTMLElement,
): { left: number; top: number } {
  const rightmost = Math.max(0, gridWrap.clientWidth - POPOVER_WIDTH);
  return {
    left: Math.min(card.offsetLeft, rightmost),
    top: card.offsetTop + card.offsetHeight + POPOVER_OFFSET,
  };
}
