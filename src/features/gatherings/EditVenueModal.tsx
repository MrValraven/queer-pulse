import { useId, useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { VenuePicker, type VenueSelection } from "./VenuePicker";
import { LinkedVenueAddress } from "./steps/LinkedVenueAddress";
import { useListingAddress } from "./steps/useVenueAddress";
import fieldStyles from "./CreateGatheringFields.module.css";
import styles from "./GatheringModals.module.css";
import whenStyles from "./steps/WhenWhereChapter.module.css";

/** The gathering-manage "Edit venue" modal: a `VenuePicker` (search the
 *  local directory, or type a venue by hand) in the same eyebrow/title/
 *  Save-Cancel shell `InlineEditModal` uses for the other detail rows. Venue
 *  gets its own modal because its value is structured (text plus an optional
 *  listing link). A linked listing also supplies the street address, shown
 *  read-only under the picker and saved with the venue, the same way the
 *  create wizard fills it. */
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

  const editTitle = t("gatherings:manage.inlineEdit.title", {
    label: t("gatherings:manage.details.venue").toLowerCase(),
  });

  return (
    <Modal
      eyebrow={t("gatherings:manage.inlineEdit.eyebrow")}
      title={editTitle}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            {t("gatherings:manage.inlineEdit.saveCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        <VenuePicker value={value} onChange={setValue} />
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
      </div>
    </Modal>
  );
}
