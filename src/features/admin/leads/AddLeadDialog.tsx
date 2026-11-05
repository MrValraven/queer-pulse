import { useId, useMemo, useRef, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useCreateLead, useLeadIsWriting } from "./api/useLeadMutations";
import {
  createLeadBodyOf,
  emptyLeadFormValues,
  leadFieldErrorOf,
  localLeadFieldError,
  localLeadRefusalOf,
  sentLinksOf,
  type LeadFieldError,
  type LeadFormValues,
} from "./leadForm.model";
import { LeadFormFields } from "./LeadFormFields";
import { adminLeadPath } from "./leadPaths";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./AdminLeads.module.css";

/**
 * Add lead: every field of a lead, the stage (To contact by default) and an
 * optional first note. A blank name or a missing type is named before
 * anything is sent. A refusal shows under the field it names, a taken email
 * or link with "Open <name>" for the lead that holds it, and folds away on
 * the next edit (a link refusal is placed by row, so an edit could move it
 * onto another link). Enter in a field submits, since the footer's Add lead
 * belongs to the form. A success toasts and closes.
 */
export function AddLeadDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const idPrefix = useId();
  const formId = `${idPrefix}-form`;
  const formErrorId = `${idPrefix}-form-refusal`;
  // LeadFormFields owns the name input, so focus finds it by its id once
  // the dialog has mounted.
  const nameInputRef = useMemo(
    () => ({
      get current(): HTMLElement | null {
        return document.getElementById(`${idPrefix}-name`);
      },
    }),
    [idPrefix],
  );
  const [values, setValues] = useState<LeadFormValues>(emptyLeadFormValues);
  const [fieldError, setFieldError] = useState<LeadFieldError | null>(null);
  // Set the moment a press is accepted, since `isPending` only flips on the
  // next render and a same-tick double press would send two leads.
  const isSendingRef = useRef(false);
  const createLead = useCreateLead();
  const isWriting = useLeadIsWriting();
  const isBusy = createLead.isPending || isWriting;
  const formError = fieldError?.field === null ? fieldError : null;

  // A create in flight keeps the dialog open (Cancel, Escape, the scrim and
  // the close button wait), so its toast and any refusal still land here.
  function close() {
    if (createLead.isPending || isSendingRef.current) return;
    onClose();
  }

  function changeValues(nextValues: LeadFormValues) {
    setValues(nextValues);
    setFieldError(null);
  }

  function submit() {
    if (isBusy || isSendingRef.current) return;
    const localRefusal = localLeadRefusalOf(values);
    if (localRefusal !== null) {
      setFieldError(localLeadFieldError(localRefusal));
      return;
    }
    const { type } = values;
    if (type === null) return;
    const sentLinks = sentLinksOf(values.links);
    const name = values.name.trim();
    isSendingRef.current = true;
    setFieldError(null);
    createLead.mutate(createLeadBodyOf({ ...values, type }), {
      onSuccess: () => {
        showToast(t("admin:leads.toast.created", { name }), "success");
        onClose();
      },
      onError: (cause) => setFieldError(leadFieldErrorOf(cause, sentLinks)),
      onSettled: () => {
        isSendingRef.current = false;
      },
    });
  }

  return (
    <Modal
      title={t("admin:leads.addDialog.title")}
      onClose={close}
      initialFocusRef={nameInputRef}
      wide
      footer={
        <>
          <Button
            variant="ghost"
            aria-disabled={createLead.isPending || undefined}
            onClick={close}
          >
            {t("admin:common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            aria-disabled={isBusy || undefined}
            aria-busy={createLead.isPending || undefined}
            aria-describedby={formError !== null ? formErrorId : undefined}
          >
            {t("admin:leads.addDialog.submit")}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={styles.addForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <LeadFormFields
          idPrefix={idPrefix}
          values={values}
          onChange={changeValues}
          fieldError={fieldError}
          openLeadPath={adminLeadPath}
          shouldShowStage
          shouldShowNote
        />
        <LeadRefusalLine
          error={formError}
          openLeadPath={adminLeadPath}
          id={formErrorId}
        />
      </form>
    </Modal>
  );
}
