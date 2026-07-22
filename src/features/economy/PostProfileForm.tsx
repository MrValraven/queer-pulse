import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  FlatmateProfileDTO,
  UpsertFlatmateProfileBody,
} from "./api/flatmateProfile.api";
import { PostProfileFormFields } from "./PostProfileFormFields";
import { usePostProfileFormState } from "./usePostProfileFormState";
import styles from "./FlatmatesPage.module.css";

export function PostProfileForm({
  initial,
  onSubmit,
  onClose,
}: {
  /** The caller's existing profile (live, edit mode) — null/undefined for a
   * fresh, empty create form (demo always passes null). */
  initial?: FlatmateProfileDTO | null;
  onSubmit: (body: UpsertFlatmateProfileBody) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const form = usePostProfileFormState(initial);

  const handleSubmit = () => {
    const body = form.buildBody();
    if (body) onSubmit(body);
  };

  return (
    <>
      <div className={styles.modalTitle}>
        {t("economy:postProfileForm.title")}
      </div>
      <p className={styles.modalSub}>{t("economy:postProfileForm.sub")}</p>
      <PostProfileFormFields form={form} />
      <div className={styles.modalActions}>
        <Button
          type="button"
          variant="primary"
          disabled={!form.canSubmit}
          onClick={handleSubmit}
        >
          {t("economy:postProfileForm.submitCta")}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </Button>
      </div>
    </>
  );
}
