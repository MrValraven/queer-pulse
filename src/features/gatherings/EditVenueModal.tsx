import { useId, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FieldEditorShell } from "./FieldEditorShell";
import { VenuePicker, type VenueSelection } from "./VenuePicker";
import { VenueAddressDetail } from "./VenueSelectedCard";
import { useListingAddress } from "./steps/useVenueAddress";

/** The gathering-manage venue editor: a `VenuePicker` in its inline layout
 *  (the chosen venue, a search over the local directory and a tall results
 *  list, with any typed name usable as is) in the `FieldEditorShell` the
 *  other detail rows' editors share, at the wide size so the list has room.
 *  Venue keeps its own component because its value is structured (text plus
 *  an optional listing link) and it saves through its own callback that
 *  keeps the listing id. A linked listing also supplies the street address,
 *  shown read-only inside the chosen venue's card and saved with the venue,
 *  the same way the create wizard fills it. On a phone with the keyboard up
 *  the sheet folds its sub line away, so the results list keeps a few rows
 *  above the keyboard. */
export function EditVenueModal({
  initial,
  onClose,
  onSave,
}: {
  initial: VenueSelection;
  onClose: () => void;
  onSave: (value: VenueSelection) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState<VenueSelection>(initial);
  const pickerLabelId = useId();
  const linkedVenue = value.venueListing;
  const { venueAddress, isLoading } = useListingAddress(linkedVenue?.slug);
  // Hold Save while a linked listing's address is in flight, so the venue
  // always saves together with its address.
  const isAddressLoading = linkedVenue !== null && isLoading;
  const canSave =
    !isAddressLoading &&
    value.text.trim().length > 0 &&
    (value.text !== initial.text || value.listingId !== initial.listingId);

  const save = () => {
    if (!canSave) return;
    onSave({
      ...value,
      text: value.text.trim(),
      ...(venueAddress ? { address: venueAddress } : {}),
    });
    onClose();
  };

  return (
    <FieldEditorShell
      title={t("gatherings:manage.details.venue")}
      sub={t("gatherings:manage.fieldEditor.venueSub")}
      isSaveEnabled={canSave}
      onSave={save}
      onClose={onClose}
      wide
      shouldCollapseSubWithKeyboard
    >
      {/* The dialog's title names the field on screen, so the picker's
          label is for screen readers alone. */}
      <span id={pickerLabelId} className="visuallyHidden">
        {t("gatherings:manage.details.venue")}
      </span>
      <VenuePicker
        value={value}
        onChange={setValue}
        labelledBy={pickerLabelId}
        layout="inline"
        selectionDetail={
          linkedVenue && venueAddress ? (
            <VenueAddressDetail address={venueAddress} />
          ) : undefined
        }
      />
    </FieldEditorShell>
  );
}
