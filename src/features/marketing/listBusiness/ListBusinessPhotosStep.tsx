import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { PhotosFields } from "./fields/PhotosFields";
import { OwnerFields } from "./fields/OwnerFields";
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
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step4.title")}
        em={t("marketing:listBusiness.step4.em")}
        sub={t("marketing:listBusiness.step4.sub")}
      />

      <PhotosFields form={form} uploadPhoto={uploadPhoto} />

      {/* The owner half is written in the first person about whoever is
          filling the form in, so a staff-authored draft leaves it off the
          page. The owner fills it in after accepting the handover. */}
      {!form.draft.isStaffAuthored && (
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
