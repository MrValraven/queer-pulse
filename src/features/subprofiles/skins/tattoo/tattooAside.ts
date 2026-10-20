import type { PersonaViewMode } from "../../personaSkinRender";
import type { TattooView } from "./tattooView";

/** "How to book" shows while the How to book block has something to read,
 *  and always for the owner, whose empty block is a chapter to fill. */
export function isTattooBookShown(
  view: TattooView,
  mode: PersonaViewMode,
): boolean {
  return view.hasContent.booking || mode === "owner";
}

/** The sidebar's first card: status, "From", deposit and "How to book". */
export function hasTattooBookingCard(
  view: TattooView,
  mode: PersonaViewMode,
): boolean {
  return (
    view.status !== null ||
    view.prices.minimum !== null ||
    view.prices.depositAmount !== null ||
    isTattooBookShown(view, mode)
  );
}

export function hasTattooStudio(view: TattooView): boolean {
  return (
    view.venue !== null ||
    view.city !== "" ||
    view.isPrivateStudio ||
    view.isByAppointmentOnly
  );
}

/** Whether the sidebar has any card to show; the page drops the aside (and
 *  its column) when it has none. */
export function hasTattooSidebar(
  view: TattooView,
  mode: PersonaViewMode,
): boolean {
  return (
    hasTattooBookingCard(view, mode) ||
    view.guestSpots.next !== null ||
    hasTattooStudio(view)
  );
}
