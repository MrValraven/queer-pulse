import { useSearchParams } from "react-router-dom";

export type BrowseLayout = "tickets" | "agenda";

/** The URL parameter that picks the Browse tab's card layout. */
export const BROWSE_LAYOUT_PARAM = "browseLayout";

/**
 * Which layout the Browse tab draws its events in: `tickets` (a responsive
 * grid of `EventTicketCard`) or `agenda` (one column of `EventAgendaRow`).
 *
 * It is a comparison switch for the product owner, so there is no control for
 * it on screen: `?browseLayout=agenda` turns it on, and anything else,
 * including no parameter at all, reads as `tickets`. `writeBrowseFilters`
 * copies every parameter it does not own, so changing a filter keeps it.
 */
export function useBrowseLayout(): BrowseLayout {
  const [params] = useSearchParams();
  return params.get(BROWSE_LAYOUT_PARAM) === "agenda" ? "agenda" : "tickets";
}
