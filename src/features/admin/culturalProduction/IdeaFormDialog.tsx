import { useId, useRef, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal } from "../ui";
import {
  culturalReasonOf,
  type CulturalIdeaDTO,
} from "./api/culturalProduction.types";
import {
  useCreateCulturalIdea,
  useIsCulturalWriteInFlight,
  useUpdateCulturalIdea,
} from "./api/useCulturalIdeaMutations";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  changedIdeaFieldsOf,
  createIdeaBodyOf,
  emptyIdeaFormValues,
  fieldOfCulturalReason,
  ideaFormValuesOf,
  localIdeaReasonOf,
  localIdeaRefusal,
  shownIdeaFormValuesOf,
  updateIdeaBodyOf,
  type IdeaFormField,
  type IdeaFormValues,
} from "./ideaForm.model";
import { IdeaFormFields } from "./IdeaFormFields";
import styles from "./Ideas.module.css";

const FORM_PREFIX = "admin:culturalProduction.ideas.form";

/**
 * Add idea or Edit idea. Add starts empty with status New; edit starts from
 * the stored idea and shows its status too, sending only what changed. The
 * submit button names its action. A press while a required field is missing
 * names it under its field, so nothing is sent; a server refusal lands under
 * the field it names, or above the buttons, and folds away on the next edit.
 * A write in flight keeps the dialog open so its answer still lands here.
 */
export function IdeaFormDialog({
  mode,
  idea,
  onClose,
  onCreated,
}: {
  mode: "add" | "edit";
  idea?: CulturalIdeaDTO;
  onClose: () => void;
  onCreated?: (idea: CulturalIdeaDTO) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const idPrefix = useId();
  const formId = `${idPrefix}-form`;
  const formRefusalId = `${idPrefix}-form-refusal`;
  const editedIdea = mode === "edit" ? (idea ?? null) : null;
  const isEdit = editedIdea !== null;
  const [typedValues, setTypedValues] = useState<IdeaFormValues>(() =>
    editedIdea !== null ? ideaFormValuesOf(editedIdea) : emptyIdeaFormValues(),
  );
  // The fields typed into: only these are sent, and only these keep the
  // typed value when the idea refetches with a teammate's newer save.
  const [touchedFields, setTouchedFields] = useState<
    ReadonlySet<IdeaFormField>
  >(() => new Set());
  const values =
    editedIdea !== null
      ? shownIdeaFormValuesOf(typedValues, touchedFields, editedIdea)
      : typedValues;
  const [error, setError] = useState<unknown>(null);
  // Set the moment a press is accepted, since `isPending` flips a render
  // later and a same-tick double press would send twice.
  const isSendingRef = useRef(false);
  const createIdea = useCreateCulturalIdea();
  const updateIdea = useUpdateCulturalIdea(idea?.id ?? "");
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const isPending = createIdea.isPending || updateIdea.isPending;
  const isBusy = isPending || isWriteInFlight;
  const isMissingRequired = localIdeaReasonOf(values) !== null;

  const mappedField = fieldOfCulturalReason(culturalReasonOf(error));
  const refusalField = mappedField === "status" && !isEdit ? null : mappedField;
  const formError = error !== null && refusalField === null ? error : null;

  function close() {
    if (isPending || isSendingRef.current) return;
    onClose();
  }

  function changeValues(nextValues: IdeaFormValues) {
    const changedFields = changedIdeaFieldsOf(values, nextValues);
    setTypedValues(nextValues);
    setTouchedFields(
      (previousFields) => new Set([...previousFields, ...changedFields]),
    );
    setError(null);
  }

  function settle() {
    isSendingRef.current = false;
  }

  function submit() {
    if (isBusy || isSendingRef.current) return;
    const localReason = localIdeaReasonOf(values);
    if (localReason !== null) {
      setError(localIdeaRefusal(localReason));
      return;
    }
    const { eventType } = values;
    if (eventType === null) return;
    const checkedValues = { ...values, eventType };
    setError(null);
    if (editedIdea !== null) {
      const body = updateIdeaBodyOf(checkedValues, touchedFields, editedIdea);
      if (Object.keys(body).length === 0) {
        onClose();
        return;
      }
      isSendingRef.current = true;
      updateIdea.mutate(body, {
        onSuccess: () => {
          showToast(t(`${FORM_PREFIX}.savedToast`), "success");
          onClose();
        },
        onError: (cause) => setError(cause),
        onSettled: settle,
      });
      return;
    }
    isSendingRef.current = true;
    createIdea.mutate(createIdeaBodyOf(checkedValues), {
      onSuccess: (createdIdea) => {
        showToast(t(`${FORM_PREFIX}.addedToast`), "success");
        onClose();
        onCreated?.(createdIdea);
      },
      onError: (cause) => setError(cause),
      onSettled: settle,
    });
  }

  return (
    <AdminModal
      title={t(isEdit ? `${FORM_PREFIX}.editTitle` : `${FORM_PREFIX}.addTitle`)}
      onClose={close}
      footer={
        <>
          <Button
            variant="ghost"
            aria-disabled={isPending || undefined}
            onClick={close}
          >
            {t("admin:culturalProduction.common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            aria-disabled={isBusy || isMissingRequired || undefined}
            aria-busy={isPending || undefined}
            aria-describedby={formError !== null ? formRefusalId : undefined}
          >
            {isPending
              ? t("admin:culturalProduction.common.saving")
              : t(
                  isEdit
                    ? `${FORM_PREFIX}.saveEditCta`
                    : `${FORM_PREFIX}.saveAddCta`,
                )}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <IdeaFormFields
          idPrefix={idPrefix}
          values={values}
          onChange={changeValues}
          error={error}
          refusalField={refusalField}
          shouldShowStatus={isEdit}
          isDisabled={isPending}
        />
        <CulturalRefusalLine error={formError} id={formRefusalId} />
      </form>
    </AdminModal>
  );
}
