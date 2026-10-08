import type { ReactNode } from "react";
import { VenuePickerDropdown } from "./VenuePickerDropdown";
import { VenuePickerInline } from "./VenuePickerInline";

/** A gathering's venue: either free text, or a structured link to a real
 *  directory listing (name mirrors the listing's own, so display never
 *  diverges from what the link points at). */
export interface VenueSelection {
  text: string;
  listingId: string | null;
  venueListing: { slug: string; name: string } | null;
  /** The linked listing's street address. Set only by the manage page's
   *  "Edit venue" modal, and only when the listing has one. */
  address?: string;
}

/**
 * Pick a gathering's venue from the local business directory, or type one in
 * by hand. Two layouts share one value shape. `dropdown` (the default, drawn
 * by the create-gathering wizard's `steps/PlaceFields.tsx`) floats its
 * results in a popover under the search field. `inline` (the manage page's
 * Edit venue modal) keeps the selected venue, the search and a tall results
 * list on the page together, because a popover inside a dialog's scrolling
 * body is clipped to a sliver.
 */
export function VenuePicker({
  value,
  onChange,
  id,
  labelledBy,
  layout = "dropdown",
  selectionDetail,
}: {
  value: VenueSelection;
  onChange: (value: VenueSelection) => void;
  id?: string;
  labelledBy?: string;
  layout?: "dropdown" | "inline";
  /** Inline layout only: extra detail about the chosen venue, drawn inside
   *  its card (the Edit venue modal passes the listing's street address). */
  selectionDetail?: ReactNode;
}) {
  if (layout === "inline") {
    return (
      <VenuePickerInline
        value={value}
        onChange={onChange}
        id={id}
        labelledBy={labelledBy}
        selectionDetail={selectionDetail}
      />
    );
  }
  return (
    <VenuePickerDropdown
      value={value}
      onChange={onChange}
      id={id}
      labelledBy={labelledBy}
    />
  );
}
