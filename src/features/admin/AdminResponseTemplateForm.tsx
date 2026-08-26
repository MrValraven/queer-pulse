import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import {
  useCreateModResponseTemplate,
  useUpdateModResponseTemplate,
} from "./api/AdminResponseTemplateHooks";
import { AUDIT_ACTION_LABEL_KEY } from "./moderationActionLabels";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
import { TEMPLATE_PLACEHOLDERS } from "./AdminResponseTemplateFill";
import type {
  ModActionCode,
  ModResponseTemplateAdminDTO,
} from "./api/adminModResponseTemplates.api";
import type { ReasonCode } from "../safety/reportReasons";
import styles from "./AdminResponseTemplates.module.css";

const FORM_ID = "admin-response-template-form";

/** The same 2000-character ceiling `ModActionDto.note` enforces, so a template
 *  can never prefill a note the action endpoint would reject. */
const BODY_MAX_LENGTH = 2000;

/** Every member-selectable reason, derived from the label map so a new code
 *  turns up here the moment the taxonomy gains one. */
const TEMPLATE_REASON_CODES = Object.keys(REASON_LABEL_KEYS) as ReasonCode[];

/** Every action a template can be keyed to, in the order the drawer offers
 *  them. `escalate` is deliberately absent: escalating hands the report to
 *  someone else rather than telling a member anything. `shield` is gone from
 *  the action set entirely (TS-02). */
const TEMPLATE_ACTION_CODES: ModActionCode[] = [
  "dismiss",
  "warn",
  "hide_content",
  "remove_content",
  "restrict",
  "suspend",
  "ban",
];

interface TemplateDraft {
  label: string;
  body: string;
  reasonCode: ReasonCode | "";
  actionCode: ModActionCode | "";
}

function draftFrom(
  template: ModResponseTemplateAdminDTO | null,
): TemplateDraft {
  return {
    label: template?.label ?? "",
    body: template?.body ?? "",
    reasonCode: template?.reasonCode ?? "",
    actionCode: template?.actionCode ?? "",
  };
}

/**
 * Create/edit modal for one saved response. `template` is null for "New
 * response" and the existing record for "Edit". The empty option on each
 * picker means "fits any", which is how one general closing note stays a
 * single row instead of being copied across the whole reason taxonomy.
 */
export function AdminResponseTemplateForm({
  template,
  onClose,
}: {
  template: ModResponseTemplateAdminDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createTemplate = useCreateModResponseTemplate();
  const updateTemplate = useUpdateModResponseTemplate();
  const [draft, setDraft] = useState<TemplateDraft>(() => draftFrom(template));
  const isEditing = template !== null;
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  function patch(changes: Partial<TemplateDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = {
      label: draft.label.trim(),
      body: draft.body.trim(),
      reasonCode: draft.reasonCode === "" ? null : draft.reasonCode,
      actionCode: draft.actionCode === "" ? null : draft.actionCode,
    };
    const onError = (error: unknown) =>
      showToast(
        describeError(
          t("admin:moderation.templates.form.saveError"),
          error,
          t("shared:apiError.tryAgainTail"),
        ),
        "error",
      );

    if (template) {
      updateTemplate.mutate(
        { id: template.id, body },
        {
          onSuccess: () => {
            showToast(
              t("admin:moderation.templates.toast.updated", {
                label: body.label,
              }),
              "success",
            );
            onClose();
          },
          onError,
        },
      );
      return;
    }
    createTemplate.mutate(body, {
      onSuccess: () => {
        showToast(
          t("admin:moderation.templates.toast.created", { label: body.label }),
          "success",
        );
        onClose();
      },
      onError,
    });
  }

  return (
    <AdminModal
      eyebrow={t("admin:moderation.templates.eyebrow")}
      title={
        isEditing
          ? draft.label || t("admin:moderation.templates.form.editTitle")
          : t("admin:moderation.templates.form.createTitle")
      }
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={isSaving}
          >
            {isEditing
              ? t("admin:common.saveChanges")
              : t("admin:moderation.templates.form.createCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.editorGrid} onSubmit={handleSubmit}>
        <div className={styles.fieldGroupWide}>
          <label
            className={styles.fieldLabel}
            htmlFor="response-template-label"
          >
            {t("admin:moderation.templates.form.labelField")}
          </label>
          <input
            id="response-template-label"
            className={styles.textInput}
            value={draft.label}
            maxLength={120}
            required
            onChange={(event) => patch({ label: event.target.value })}
          />
          <p className={styles.fieldHint}>
            {t("admin:moderation.templates.form.labelHint")}
          </p>
        </div>

        <div>
          <label
            className={styles.fieldLabel}
            htmlFor="response-template-reason"
          >
            {t("admin:moderation.templates.form.reasonField")}
          </label>
          <select
            id="response-template-reason"
            className={styles.select}
            value={draft.reasonCode}
            onChange={(event) =>
              patch({ reasonCode: event.target.value as ReasonCode | "" })
            }
          >
            <option value="">
              {t("admin:moderation.templates.anyReason")}
            </option>
            {TEMPLATE_REASON_CODES.map((code) => (
              <option key={code} value={code}>
                {t(REASON_LABEL_KEYS[code])}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={styles.fieldLabel}
            htmlFor="response-template-action"
          >
            {t("admin:moderation.templates.form.actionField")}
          </label>
          <select
            id="response-template-action"
            className={styles.select}
            value={draft.actionCode}
            onChange={(event) =>
              patch({ actionCode: event.target.value as ModActionCode | "" })
            }
          >
            <option value="">
              {t("admin:moderation.templates.anyAction")}
            </option>
            {TEMPLATE_ACTION_CODES.map((code) => {
              const labelKey = AUDIT_ACTION_LABEL_KEY[code];
              return (
                <option key={code} value={code}>
                  {labelKey ? t(labelKey) : code}
                </option>
              );
            })}
          </select>
        </div>

        <div className={styles.fieldGroupWide}>
          <label className={styles.fieldLabel} htmlFor="response-template-body">
            {t("admin:moderation.templates.form.bodyField")}
          </label>
          <textarea
            id="response-template-body"
            className={styles.textarea}
            rows={8}
            value={draft.body}
            maxLength={BODY_MAX_LENGTH}
            required
            onChange={(event) => patch({ body: event.target.value })}
          />
          <p className={styles.fieldHint}>
            {t("admin:moderation.templates.form.bodyHint", {
              tokens: TEMPLATE_PLACEHOLDERS.map((token) => `{${token}}`).join(
                ", ",
              ),
            })}
          </p>
        </div>
      </form>
    </AdminModal>
  );
}
