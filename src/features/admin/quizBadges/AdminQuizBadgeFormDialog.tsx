import { useId, useRef, useState, type FormEvent } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Modal } from "../../../shared/components/ui";
import type { QuizBadgeDefinitionDTO } from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  quizWinBadgeErrorText,
  quizWinBadgeRefusal,
} from "../../quizshow/winBadges/quizWinBadgeErrors";
import {
  useCreateQuizBadge,
  useUpdateQuizBadge,
} from "./api/useQuizBadgeLibrary";
import { AdminQuizBadgeFormFields } from "./AdminQuizBadgeFormFields";
import { AdminQuizBadgePreview } from "./AdminQuizBadgePreview";
import {
  createBodyFromDraft,
  draftFromDefinition,
  draftProblem,
  emptyQuizBadgeDraft,
  fieldOfRefusal,
  previewInputFromDraft,
  updateBodyFromDraft,
  type QuizBadgeDraft,
  type QuizBadgeFormField,
} from "./quizBadgeForm.model";
import styles from "./AdminQuizBadges.module.css";

export type AdminQuizBadgeFormMode =
  { kind: "create" } | { kind: "edit"; definition: QuizBadgeDefinitionDTO };

/** The refusal held under each field, from the form or the server. A field
 *  with nothing to say has no entry. */
type FieldRefusals = Partial<Record<QuizBadgeFormField, unknown>>;

const DRAFT_FIELDS: readonly QuizBadgeFormField[] = [
  "nameEn",
  "namePt",
  "descriptionEn",
  "descriptionPt",
  "iconKey",
  "tint",
  "rarity",
];

/** The fields whose value differs between two drafts. */
function changedFieldsOf(
  previous: QuizBadgeDraft,
  next: QuizBadgeDraft,
): QuizBadgeFormField[] {
  return DRAFT_FIELDS.filter((field) => previous[field] !== next[field]);
}

/**
 * Create a quiz badge, or edit one. Save checks the texts the way the server
 * does first, and a refusal from either lands under the field it names; a
 * refusal no field owns is a toast. The preview draws the badge as members
 * see it. Mount it inside `<AnimatePresence>`.
 */
export function AdminQuizBadgeFormDialog({
  mode,
  onClose,
}: {
  mode: AdminQuizBadgeFormMode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const formId = useId();
  // The dialog opens on the first field, the English name.
  const nameEnRef = useRef<HTMLInputElement>(null);
  const editedDefinition = mode.kind === "edit" ? mode.definition : null;
  const [draft, setDraft] = useState<QuizBadgeDraft>(() =>
    editedDefinition
      ? draftFromDefinition(editedDefinition)
      : emptyQuizBadgeDraft(),
  );
  const [refusals, setRefusals] = useState<FieldRefusals>({});
  const createBadge = useCreateQuizBadge();
  const updateBadge = useUpdateQuizBadge();
  const isPending = createBadge.isPending || updateBadge.isPending;
  // Escape, the close button and Cancel wait for a save in flight, so its
  // refusal or its success toast always has its dialog to land in.
  const close = () => {
    if (!isPending) onClose();
  };

  const errors: Partial<Record<QuizBadgeFormField, string>> = {};
  for (const field of DRAFT_FIELDS) {
    if (refusals[field] !== undefined)
      errors[field] = quizWinBadgeErrorText(refusals[field], t, fmt);
  }

  const change = (next: QuizBadgeDraft) => {
    const changedFields = changedFieldsOf(draft, next);
    setDraft(next);
    if (changedFields.some((field) => refusals[field] !== undefined)) {
      setRefusals((previous) => {
        const remaining = { ...previous };
        changedFields.forEach((field) => delete remaining[field]);
        return remaining;
      });
    }
  };

  const handleRefusal = (error: unknown) => {
    const field = fieldOfRefusal(error);
    if (field) setRefusals((previous) => ({ ...previous, [field]: error }));
    else showToast(quizWinBadgeErrorText(error, t, fmt), "error");
  };

  const finish = (toastKey: string) => {
    showToast(t(toastKey), "success");
    onClose();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    const problem = draftProblem(draft);
    if (problem) {
      setRefusals({
        [problem.field]: quizWinBadgeRefusal(problem.code, {
          language: problem.language,
        }),
      });
      return;
    }
    setRefusals({});
    if (editedDefinition) {
      updateBadge.mutate(
        {
          definitionId: editedDefinition.id,
          body: updateBodyFromDraft(draft, editedDefinition),
        },
        {
          onSuccess: () => finish("quizshow:winBadges.admin.library.saved"),
          onError: handleRefusal,
        },
      );
      return;
    }
    createBadge.mutate(createBodyFromDraft(draft), {
      onSuccess: () => finish("quizshow:winBadges.admin.library.created"),
      onError: handleRefusal,
    });
  };

  return (
    <Modal
      wide
      initialFocusRef={nameEnRef}
      title={
        editedDefinition
          ? t("quizshow:winBadges.admin.library.edit")
          : t("quizshow:winBadges.admin.library.create")
      }
      onClose={close}
      footer={
        <div className={styles.formActions}>
          <Button variant="ghost" onClick={close} disabled={isPending}>
            {t("quizshow:winBadges.admin.form.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            aria-disabled={isPending || undefined}
          >
            {t("quizshow:winBadges.admin.form.save")}
          </Button>
        </div>
      }
    >
      <form id={formId} className={styles.form} onSubmit={submit} noValidate>
        <AdminQuizBadgeFormFields
          draft={draft}
          onChange={change}
          errors={errors}
          nameEnRef={nameEnRef}
        />
        <AdminQuizBadgePreview input={previewInputFromDraft(draft)} />
      </form>
    </Modal>
  );
}
