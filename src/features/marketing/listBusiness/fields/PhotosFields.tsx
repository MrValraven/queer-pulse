import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import { ListingPhotoGallery } from "../ListingPhotoGallery";
import styles from "../ListBusinessPage.module.css";

/**
 * The photo field body: the four-slot gallery with its per-slot alt text.
 *
 * Shared by the create wizard's step 4 pane (`StepPhotosYou`) and the owner
 * editor's Photos section. Carries `ANCHOR.photos`, so the "add alt text"
 * chip in the still-needed bar has a field to scroll to on both surfaces.
 */
export function PhotosFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.photos}
      label={t("marketing:listBusiness.step4.photosLabel")}
      helper={t(
        form.draft.online
          ? "marketing:listBusiness.step4.photosHelperOnline"
          : "marketing:listBusiness.step4.photosHelper",
      )}
    >
      <ListingPhotoGallery form={form} />
    </FormField>
  );
}
