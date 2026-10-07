import { useId, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FieldEditorShell } from "./FieldEditorShell";
import { VenuePicker, type VenueSelection } from "./VenuePicker";
import { LinkedVenueAddress } from "./steps/LinkedVenueAddress";
import { useListingAddress } from "./steps/useVenueAddress";
import fieldStyles from "./CreateGatheringFields.module.css";
import whenStyles from "./steps/WhenWhereChapter.module.css";

/** The gathering-manage venue editor: a `VenuePicker` (search the local
 *  directory, or type a venue by hand) in the `FieldEditorShell` the other
 *  detail rows' editors share. Venue keeps its own component because its
 *  value is structured (text plus an optional listing link) and it saves
 *  through its own callback that keeps the listing id. A linked listing also
 *  supplies the street address, shown read-only under the picker and saved
 *  with the venue, the same way the create wizard fills it. */
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
  const addressLabelId = useId();
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
      />
      {linkedVenue && venueAddress && (
        <div>
          <div id={addressLabelId} className={fieldStyles.label}>
            {t("gatherings:create.v2.when.addressLabel")}
            <span className={whenStyles.labelNote}>
              {t("gatherings:create.v2.when.addressNote")}
            </span>
          </div>
          <LinkedVenueAddress
            labelId={addressLabelId}
            address={venueAddress}
            venueName={linkedVenue.name}
          />
        </div>
      )}
    </FieldEditorShell>
  );
}
