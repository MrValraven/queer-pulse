import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { VenuePicker, type VenueSelection } from "./VenuePicker";
import styles from "./GatheringModals.module.css";

/** The gathering-manage "Edit venue" modal — a `VenuePicker` (search the
 *  local directory, or type a venue by hand) in the same eyebrow/title/
 *  Save-Cancel shell `InlineEditModal` uses for the other detail rows. Venue
 *  gets its own modal because its value is structured (text + an optional
 *  listing link), not the plain string `InlineEditModal` saves. */
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
  const canSave =
    value.text.trim().length > 0 &&
    (value.text !== initial.text || value.listingId !== initial.listingId);

  const save = () => {
    if (!canSave) return;
    onSave({ ...value, text: value.text.trim() });
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
      </div>
    </Modal>
  );
}
