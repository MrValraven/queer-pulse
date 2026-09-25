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
import type {
  EmailLocaleContent,
  EmailTemplateAdminDTO,
} from "./emailTemplate.types";
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
import { EmailTemplateMetaFields } from "./EmailTemplateMetaFields";
import { EmailTemplateSaveErrorBanner } from "./EmailTemplateSaveErrorBanner";
import { EmailTemplateToolbar } from "./EmailTemplateToolbar";
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
  // Set while "Save and leave" runs and kept once it succeeds: the visitor
  // asked to go somewhere else, so the redirect to a newly created template's
  // URL would race the guard's own navigation and could strand them here.
  // Cleared again when the save fails and they stay.
  const isLeavingAfterSaveRef = useRef(false);

  useUnsavedChangesGuard({
    active: isDirty,
    confirmMessage: t("admin:emailTemplates.editor.leaveConfirm"),
    // The `?emailDesign=` switch changes only the query, and the draft stays
    // mounted through it, so it must not ask to leave.
    shouldAllowQueryChanges: true,
    // Offered whenever the Save button is enabled, i.e. no save in flight.
    onSaveAndLeave: isSaving ? undefined : saveAndLeave,
  });

  // Declared AFTER the guard: its effect disarms first once the save clears
  // `isDirty`, so moving to the new template's URL never prompts.
  useEffect(() => {
    if (createdId && !isDirty && !isLeavingAfterSaveRef.current) {
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

  /** Saves the draft (as a new template when asked) and resolves whether it
   *  landed. A failure fills the error banner and resolves false. */
  async function save(shouldCreateNew = false): Promise<boolean> {
    const body = toWriteBody(draft);
    let saved: EmailTemplateAdminDTO | undefined;
    try {
      saved =
        templateId && !shouldCreateNew
          ? await updateTemplate.mutateAsync({ id: templateId, body })
          : await createTemplate.mutateAsync(body);
    } catch (error) {
      setSaveError(classifySaveError(error));
      return false;
    }
    handleSaved(saved);
    return true;
  }

  async function saveAndLeave(): Promise<boolean> {
    isLeavingAfterSaveRef.current = true;
    const isSaved = await save();
    if (!isSaved) isLeavingAfterSaveRef.current = false;
    return isSaved;
  }

  const content = draft.locales[activeLocale];
  const updateActiveLocale = (
    update: (current: EmailLocaleContent) => EmailLocaleContent,
  ) => draftState.updateLocale(activeLocale, update);

  return (
    <div className={styles.editor}>
      {saveError && (
        <EmailTemplateSaveErrorBanner
          error={saveError}
          onSaveAsNew={() => void save(true)}
        />
      )}
      <EmailTemplateMetaFields draft={draft} onChange={draftState.setMeta} />
      <EmailTemplateToolbar
        locale={activeLocale}
        onLocaleChange={setActiveLocale}
        isLocaleDirty={draftState.isLocaleDirty}
        purpose={draft.purpose}
        content={content}
        onUpdate={updateActiveLocale}
        onInsertToken={(token) => activeFieldRef.current?.insert(token)}
      />
      {content ? (
        <EmailTemplateLocalePane
          key={activeLocale}
          locale={activeLocale}
          purpose={draft.purpose}
          content={content}
          onUpdate={updateActiveLocale}
          onFocusField={(field) => {
            activeFieldRef.current = field;
          }}
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
        <Button variant="ghost" size="md" to={routes.adminEmailTemplates}>
          {t("admin:emailTemplates.editor.backCta")}
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={isSaving || !isDirty}
          onClick={() => void save()}
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
