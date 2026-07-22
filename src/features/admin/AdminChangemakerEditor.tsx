import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import {
  useCreateChangemaker,
  useUpdateChangemaker,
} from "../community/api/useAdminChangemakers";
import type {
  ChangemakerDTO,
  CreateChangemakerBody,
} from "../community/api/changemakers.api";
import {
  AdminChangemakerBasicFields,
  AdminChangemakerStoryFields,
} from "./AdminChangemakerEditorFields";
import {
  draftFromProfile,
  draftToBody,
  emptyDraft,
  type ChangemakerFormDraft,
} from "./adminChangemakerEditor.utils";
import styles from "./AdminChangemakersPage.module.css";

/**
 * Create/edit drawer for a directory profile. `profile === null` means
 * create mode. Self-contained: owns its own draft state and calls
 * `useScrollLock()` (via `AdminModal`) unconditionally, since it is only
 * mounted while open.
 */
export function AdminChangemakerEditor({
  profile,
  onClose,
}: {
  profile: ChangemakerDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createChangemaker = useCreateChangemaker();
  const updateChangemaker = useUpdateChangemaker();
  const [draft, setDraft] = useState<ChangemakerFormDraft>(
    profile ? draftFromProfile(profile) : emptyDraft(),
  );

  const isPending = createChangemaker.isPending || updateChangemaker.isPending;

  function updateDraft(patch: Partial<ChangemakerFormDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSubmit() {
    if (!draft.name.trim()) {
      showToast(
        t("community:changemakers.admin.editor.nameRequiredToast"),
        "error",
      );
      return;
    }
    const body: CreateChangemakerBody = draftToBody(draft);
    if (profile) {
      updateChangemaker.mutate(
        { id: profile.id, body },
        {
          onSuccess: () => {
            showToast(
              t("community:changemakers.admin.editor.updatedToast"),
              "success",
            );
            onClose();
          },
        },
      );
    } else {
      createChangemaker.mutate(body, {
        onSuccess: () => {
          showToast(
            t("community:changemakers.admin.editor.createdToast"),
            "success",
          );
          onClose();
        },
      });
    }
  }

  return (
    <AdminModal
      onClose={onClose}
      wide
      eyebrow={t("community:changemakers.admin.navLabel")}
      title={
        profile
          ? t("community:changemakers.admin.editor.editTitle")
          : t("community:changemakers.admin.editor.createTitle")
      }
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("community:changemakers.admin.cancelCta")}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {t("community:changemakers.admin.editor.saveCta")}
          </Button>
        </>
      }
    >
      <div className={styles.editorGrid}>
        <AdminChangemakerBasicFields draft={draft} onChange={updateDraft} />
        <AdminChangemakerStoryFields draft={draft} onChange={updateDraft} />
      </div>
    </AdminModal>
  );
}
