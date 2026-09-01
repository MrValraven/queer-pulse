import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  FlatmateProfileDTO,
  UpsertFlatmateProfileBody,
} from "./api/flatmateProfile.api";
import { FlatmateProfileDangerZone } from "./FlatmateProfileDangerZone";
import { PostProfileFormFields } from "./PostProfileFormFields";
import { PostProfileHouseholdFields } from "./PostProfileHouseholdFields";
import { PostProfileIdentityFields } from "./PostProfileIdentityFields";
import { usePostProfileFormState } from "./usePostProfileFormState";
import styles from "./FlatmatesPage.module.css";

export function PostProfileForm({
  initial,
  onSubmit,
  onClose,
  onDeleted,
  submitting = false,
}: {
  /** The caller's existing profile (live, edit mode) — null/undefined for a
   * fresh, empty create form (demo always passes null). */
  initial?: FlatmateProfileDTO | null;
  onSubmit: (body: UpsertFlatmateProfileBody) => void;
  onClose: () => void;
  /** Runs after the member's own profile was taken down (server confirmed).
   * Only ever reachable in edit mode, where `initial` is a real profile. */
  onDeleted?: () => void;
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
      {/* The same form both creates and edits. Saying "Post your profile" over
          an existing one made the editor hard to recognise as the place your
          own profile is managed, which is exactly where a member looks for the
          take-down below. */}
      <div className={styles.modalTitle}>
        {t(
          initial
            ? "economy:postProfileForm.editTitle"
            : "economy:postProfileForm.title",
        )}
      </div>
      <p className={styles.modalSub}>
        {t(
          initial
            ? "economy:postProfileForm.editSub"
            : "economy:postProfileForm.sub",
        )}
      </p>
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
          {t(
            initial
              ? "economy:postProfileForm.editSubmitCta"
              : "economy:postProfileForm.submitCta",
          )}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </Button>
      </div>
      {/* Only an existing profile can be taken down, so the group appears in
          edit mode and never on the create form. In demo mode `initial` is
          always null, which is why the demo board never renders it. */}
      {initial && onDeleted && (
        <FlatmateProfileDangerZone onDeleted={onDeleted} />
      )}
    </>
  );
}
