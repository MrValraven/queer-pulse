import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
} from "./api/emailTemplateHooks";
import type { EmailTemplateAdminDTO } from "./emailTemplate.types";
import {
  draftFromTemplate,
  toWriteBody,
  type EmailTemplateDraft,
} from "./emailTemplateDraft";
import {
  classifySaveError,
  type EmailTemplateSaveError,
} from "./emailTemplateSaveError";
import type { ActiveField } from "./editor/activeField";
import { EmailTemplateLocalePane } from "./EmailTemplateLocalePane";
import { EmailTemplateLocaleTabs } from "./EmailTemplateLocaleTabs";
import { EmailTemplateMetaFields } from "./EmailTemplateMetaFields";
import { EmailTemplateSaveErrorBanner } from "./EmailTemplateSaveErrorBanner";
import { useEmailTemplateDraft } from "./useEmailTemplateDraft";
import styles from "./AdminEmailTemplates.module.css";

export function EmailTemplateForm({
  templateId,
  initial,
}: {
  templateId: string | null;
  initial: EmailTemplateDraft;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const draftState = useEmailTemplateDraft(initial);
  const { draft, isDirty } = draftState;
  const [activeLocale, setActiveLocale] = useState<Language>("en");
  const [saveError, setSaveError] = useState<EmailTemplateSaveError | null>(
    null,
  );
  const [createdId, setCreatedId] = useState<string | null>(null);
  const activeFieldRef = useRef<ActiveField | null>(null);
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  useUnsavedChangesGuard({
    active: isDirty,
    confirmMessage: t("admin:emailTemplates.editor.leaveConfirm"),
  });

  // Declared AFTER the guard: its effect disarms first once the save clears
  // `isDirty`, so moving to the new template's URL never prompts.
  useEffect(() => {
    if (createdId && !isDirty) {
      void navigate(`${routes.adminEmailTemplateEdit}/${createdId}`, {
        replace: true,
      });
    }
  }, [createdId, isDirty, navigate]);

  function handleSaved(saved: EmailTemplateAdminDTO | undefined) {
    draftState.markSaved(saved ? draftFromTemplate(saved) : draft);
    setSaveError(null);
    showToast(t("admin:emailTemplates.toast.saved"), "success");
    if (saved && saved.id !== templateId) setCreatedId(saved.id);
  }

  function save(shouldCreateNew = false) {
    const body = toWriteBody(draft);
    const callbacks = {
      onSuccess: handleSaved,
      onError: (error: unknown) => setSaveError(classifySaveError(error)),
    };
    if (templateId && !shouldCreateNew)
      updateTemplate.mutate({ id: templateId, body }, callbacks);
    else createTemplate.mutate(body, callbacks);
  }

  const content = draft.locales[activeLocale];

  return (
    <div className={styles.editor}>
      {saveError && (
        <EmailTemplateSaveErrorBanner
          error={saveError}
          onSaveAsNew={() => save(true)}
        />
      )}
      <EmailTemplateMetaFields draft={draft} onChange={draftState.setMeta} />
      <EmailTemplateLocaleTabs
        active={activeLocale}
        onChange={setActiveLocale}
        isLocaleDirty={draftState.isLocaleDirty}
      />
      {content ? (
        <EmailTemplateLocalePane
          key={activeLocale}
          locale={activeLocale}
          purpose={draft.purpose}
          content={content}
          onUpdate={(update) => draftState.updateLocale(activeLocale, update)}
          onFocusField={(field) => {
            activeFieldRef.current = field;
          }}
          onInsertToken={(token) => activeFieldRef.current?.insert(token)}
        />
      ) : (
        <div className={styles.ptMissing}>
          <p>{t("admin:emailTemplates.editor.ptMissing")}</p>
          <Button
            variant="primary"
            size="md"
            onClick={draftState.startPortuguese}
          >
            {t("admin:emailTemplates.editor.ptStart")}
          </Button>
        </div>
      )}
      <div className={styles.saveBar}>
        {activeLocale === "pt" && content && (
          <Button
            variant="ghost"
            size="md"
            onClick={draftState.removePortuguese}
          >
            {t("admin:emailTemplates.editor.ptRemove")}
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          disabled={isSaving}
          onClick={() => save()}
        >
          {t(
            isSaving
              ? "admin:emailTemplates.editor.saving"
              : "admin:emailTemplates.editor.saveCta",
          )}
        </Button>
      </div>
    </div>
  );
}
