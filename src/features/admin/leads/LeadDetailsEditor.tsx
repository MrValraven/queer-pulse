import { useRef, useState, type KeyboardEvent } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadDTO } from "./api/leads.types";
import { useLeadIsWriting, useUpdateLead } from "./api/useLeadMutations";
import {
  isLeadFormDirty,
  leadFieldErrorOf,
  leadFormValuesOf,
  leadUpdateBodyOf,
  sentLinksOf,
  type LeadFieldError,
  type LeadFormValues,
} from "./leadForm.model";
import { isFocusLostOrWithin, rebasedValuesOf } from "./leadFormRebase";
import { LeadFormFields } from "./LeadFormFields";
import { adminLeadPath } from "./leadPaths";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadDetails.module.css";

/**
 * The lead's details as a form, seeded from the stored lead when edit mode
 * opens. Save changes sends what differs and, once saved, shows "Changes
 * saved" and hands back to the read view; a refusal keeps the form open
 * with the reason under its field. Cancel drops the edits. Escape does the
 * same while nothing has changed. Nothing here saves on its own: clearing
 * the follow-up date empties the field, and Save changes sends it. Fields
 * the viewer has not touched follow the stored lead, so a change saved
 * elsewhere (a colleague's edit, a stage pick) shows at once and is never
 * sent back over. Save changes and Cancel ride a bar that sticks to the
 * bottom of the screen while the form runs past it. `onDone` hears whether
 * focus should move back to Edit details.
 */
export function LeadDetailsEditor({
  lead,
  idPrefix,
  onDone,
}: {
  lead: LeadDTO;
  idPrefix: string;
  onDone: (shouldMoveFocus: boolean) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const saveDetails = useUpdateLead(lead.id);
  const isWriting = useLeadIsWriting();
  const [values, setValues] = useState<LeadFormValues>(() =>
    leadFormValuesOf(lead),
  );
  const [seededLead, setSeededLead] = useState(lead);
  const [fieldError, setFieldError] = useState<LeadFieldError | null>(null);

  // The stored lead changed: untouched fields follow it, edits stay.
  if (lead.updatedAt !== seededLead.updatedAt) {
    setSeededLead(lead);
    setValues(rebasedValuesOf(seededLead, lead, values));
  }
  const isDirty = isLeadFormDirty(lead, values);
  const isSaveBlocked = isWriting || !isDirty;

  const changeValues = (next: LeadFormValues) => {
    setValues(next);
    setFieldError(null);
  };

  const cancel = () => onDone(true);

  const save = () => {
    if (isSaveBlocked) return;
    const sentLinks = sentLinksOf(values.links);
    setFieldError(null);
    saveDetails.mutate(leadUpdateBodyOf(lead, values), {
      onSuccess: () => {
        showToast(t("admin:leads.details.saved"), "success");
        // A save lands later; focus the viewer moved elsewhere stays put.
        onDone(isFocusLostOrWithin(editorRef.current));
      },
      onError: (cause) => setFieldError(leadFieldErrorOf(cause, sentLinks)),
    });
  };

  // Escape leaves a clean form. A picker or list open inside the form
  // takes its own Escape first and marks it spent.
  const leaveOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || event.defaultPrevented || isDirty) return;
    event.preventDefault();
    cancel();
  };

  const formRefusal = fieldError?.field === null ? fieldError : null;

  return (
    // The key handler only listens for Escape bubbling up from the fields.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div ref={editorRef} className={styles.editor} onKeyDown={leaveOnEscape}>
      <LeadFormFields
        idPrefix={idPrefix}
        values={values}
        onChange={changeValues}
        fieldError={fieldError}
        openLeadPath={adminLeadPath}
        shouldShowStage={false}
        shouldShowNote={false}
      />
      <div className={styles.editBar}>
        <LeadRefusalLine error={formRefusal} openLeadPath={adminLeadPath} />
        <div className={styles.editActions}>
          <Button
            variant="primary"
            aria-disabled={isSaveBlocked || undefined}
            onClick={save}
          >
            {t("admin:leads.details.save")}
          </Button>
          <Button variant="ghost" onClick={cancel}>
            {t("admin:leads.details.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
