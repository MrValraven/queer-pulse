import { Button, FormField, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { OpenToEditor } from "../OpenToEditor";
import type { MemberProfile } from "../data/memberProfiles";
import { useUpdateNowSave } from "./useUpdateNowSave";
import styles from "./UpdateNowModal.module.css";

export interface UpdateNowModalProps {
  profile: MemberProfile;
  onClose: () => void;
}

/**
 * The owner's edit sheet for their Now: the status, the boundary note, and
 * which doors are open. All three seed from `profile`, committed on Save.
 *
 * The local field state and the save lifecycle (deferring the actual persist
 * until the shared draft carries this modal's patch, reverting an
 * abandoned/failed one, gating the error banner) live in `useUpdateNowSave`;
 * see that hook's doc comment for the reasoning. This component is just the
 * form.
 */
export function UpdateNowModal({ profile, onClose }: UpdateNowModalProps) {
  const { t } = useTranslation();
  const {
    now,
    setNow,
    notHereFor,
    setNotHereFor,
    openTo,
    setOpenTo,
    isSaving,
    visibleError,
    handleSave,
  } = useUpdateNowSave(profile, onClose);

  return (
    <Modal
      title={t("members:content.now.edit.title")}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("members:content.now.edit.cancel")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {t("members:content.now.edit.save")}
          </Button>
        </>
      }
    >
      {visibleError && (
        <p className={styles.error} role="alert">
          {visibleError}
        </p>
      )}
      <FormField label={t("members:content.now.edit.statusLabel")}>
        <textarea
          className={styles.textarea}
          value={now}
          placeholder={t("members:content.now.edit.statusPlaceholder")}
          onChange={(event) => setNow(event.target.value)}
        />
      </FormField>
      <FormField label={t("members:content.now.edit.notHereForLabel")}>
        <input
          type="text"
          value={notHereFor}
          placeholder={t("members:content.now.edit.notHereForPlaceholder")}
          onChange={(event) => setNotHereFor(event.target.value)}
        />
      </FormField>
      <p className={styles.openToLabel}>
        {t("members:content.now.edit.openToLabel")}
      </p>
      <OpenToEditor entries={openTo} onChange={setOpenTo} />
    </Modal>
  );
}
