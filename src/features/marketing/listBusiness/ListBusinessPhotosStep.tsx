import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { PhotosFields } from "./fields/PhotosFields";
import { OwnerFields } from "./fields/OwnerFields";
import { isOwnerBlockHidden } from "./ownerBlock";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 4: photos, and a little about you =====
   Wizard chrome only: both halves live in `PhotosFields` and `OwnerFields`,
   which the single-screen owner editor renders as two separate sections. */
export function StepPhotosYou({
  form,
  userName,
  uploadPhoto,
}: {
  form: ListingForm;
  userName: string;
  uploadPhoto: (
    file: File,
    options?: { crop?: CropRect },
  ) => Promise<{ key: string; previewUrl: string }>;
}) {
  const { t } = useTranslation();
  // A suggestion and a staff-authored draft both leave off the owner block
  // below, and both are photos-only from here: the header switches to copy
  // that describes photos alone rather than "photos, and a little about you".
  const isPhotosOnlyHeader = isOwnerBlockHidden(form.draft);
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t(
          isPhotosOnlyHeader
            ? "marketing:listBusiness.step4.suggest.title"
            : "marketing:listBusiness.step4.title",
        )}
        em={t(
          isPhotosOnlyHeader
            ? "marketing:listBusiness.step4.suggest.em"
            : "marketing:listBusiness.step4.em",
        )}
        sub={t(
          isPhotosOnlyHeader
            ? "marketing:listBusiness.step4.suggest.sub"
            : "marketing:listBusiness.step4.sub",
        )}
      />

      <PhotosFields form={form} uploadPhoto={uploadPhoto} />

      {/* The owner half is written in the first person about whoever is
          filling the form in, so a staff-authored draft and a suggestion both
          leave it off the page. The owner fills it in after accepting the
          handover. */}
      {!isOwnerBlockHidden(form.draft) && (
        <>
          <h3 className={styles.groupH}>
            {t("marketing:listBusiness.step4.aboutYouHeading")}
          </h3>

          <OwnerFields form={form} userName={userName} />
        </>
      )}
    </div>
  );
}
