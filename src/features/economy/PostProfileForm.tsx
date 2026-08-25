import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  FlatmateProfileDTO,
  UpsertFlatmateProfileBody,
} from "./api/flatmateProfile.api";
import { PostProfileFormFields } from "./PostProfileFormFields";
import { PostProfileHouseholdFields } from "./PostProfileHouseholdFields";
import { PostProfileIdentityFields } from "./PostProfileIdentityFields";
import { usePostProfileFormState } from "./usePostProfileFormState";
import styles from "./FlatmatesPage.module.css";

export function PostProfileForm({
  initial,
  onSubmit,
  onClose,
  submitting = false,
}: {
  /** The caller's existing profile (live, edit mode) — null/undefined for a
   * fresh, empty create form (demo always passes null). */
  initial?: FlatmateProfileDTO | null;
  onSubmit: (body: UpsertFlatmateProfileBody) => void;
  onClose: () => void;
  /** True while the upsert mutation is in flight — disables submit so a rapid
   * double-click can't fire a second POST. */
  submitting?: boolean;
}) {
  const { t } = useTranslation();
  const form = usePostProfileFormState(initial);

  const handleSubmit = () => {
    if (submitting) return;
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
      <PostProfileHouseholdFields form={form} />
      <PostProfileIdentityFields form={form} />
      <div className={styles.modalActions}>
        <Button
          type="button"
          variant="primary"
          disabled={!form.canSubmit || submitting}
          onClick={handleSubmit}
        >
          {t("economy:postProfileForm.submitCta")} <FiArrowRight aria-hidden />
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </Button>
      </div>
    </>
  );
}
