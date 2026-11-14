import {
  Collapse,
  DatePicker,
  FormField,
  Select,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  LEAD_FOLLOW_UP_MAX,
  LEAD_FOLLOW_UP_MIN,
  LEAD_LOCATION_MAX,
  LEAD_NAME_MAX,
  LEAD_NOTE_MAX,
  LEAD_STAGES,
  LEAD_TYPES,
  isLeadStage,
  isLeadType,
} from "./api/leads.types";
import {
  LeadContactFields,
  LeadFormSection,
  LeadTextField,
} from "./LeadContactFields";
import type {
  LeadFieldError,
  LeadFormField,
  LeadFormValues,
} from "./leadForm.model";
import { LEAD_STAGE_LABEL_KEY, LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
import { LeadLinksField } from "./LeadLinksField";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadForm.module.css";

/** What every group of lead fields takes: the form's values and where each
 *  change goes, the refusal to place, and the path an "Open <name>" link on
 *  a refusal opens. `idPrefix` keeps ids unique when two forms share a page. */
export interface LeadFieldsProps {
  idPrefix: string;
  values: LeadFormValues;
  onChange: (next: LeadFormValues) => void;
  fieldError: LeadFieldError | null;
  openLeadPath: (leadId: string) => string;
  isDisabled?: boolean;
}

/** The refusal that belongs under `field`, or null. */
function refusalFor(
  fieldError: LeadFieldError | null,
  field: LeadFormField,
): LeadFieldError | null {
  return fieldError?.field === field ? fieldError : null;
}

/** One select with its refusal line below. */
function LeadSelectField({
  id,
  label,
  placeholder,
  options,
  value,
  refusal,
  openLeadPath,
  isRequired = false,
  isDisabled,
  onValueChange,
}: {
  id: string;
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value: string | null;
  refusal: LeadFieldError | null;
  openLeadPath: (leadId: string) => string;
  isRequired?: boolean;
  isDisabled: boolean;
  onValueChange: (next: string | null) => void;
}) {
  const refusalId = `${id}-refusal`;
  return (
    <div className={styles.fieldBlock}>
      <FormField label={label} required={isRequired} className={styles.field}>
        <Select
          id={id}
          label={label}
          placeholder={placeholder}
          options={options}
          value={value}
          disabled={isDisabled}
          aria-invalid={refusal !== null || undefined}
          aria-describedby={refusal !== null ? refusalId : undefined}
          onChange={onValueChange}
        />
      </FormField>
      <LeadRefusalLine
        error={refusal}
        openLeadPath={openLeadPath}
        id={refusalId}
      />
    </div>
  );
}

/**
 * Type, the stage while `shouldShowStage` holds (the Add lead dialog; the
 * lead page saves its stage on its own), and location. On a wide form the
 * three share a row; with the stage hidden, type and location pair up.
 */
function LeadKindFields({
  idPrefix,
  values,
  onChange,
  fieldError,
  openLeadPath,
  isDisabled = false,
  shouldShowStage,
}: LeadFieldsProps & { shouldShowStage: boolean }) {
  const { t } = useTranslation();
  const typeOptions = LEAD_TYPES.map((type) => ({
    value: type,
    label: t(LEAD_TYPE_LABEL_KEY[type]),
  }));
  const stageOptions = LEAD_STAGES.map((stage) => ({
    value: stage,
    label: t(LEAD_STAGE_LABEL_KEY[stage]),
  }));

  return (
    <div className={styles.kindGrid}>
      <LeadSelectField
        id={`${idPrefix}-type`}
        label={t("admin:leads.field.type")}
        placeholder={t("admin:leads.field.typePlaceholder")}
        options={typeOptions}
        value={values.type}
        refusal={refusalFor(fieldError, "type")}
        openLeadPath={openLeadPath}
        isRequired
        isDisabled={isDisabled}
        onValueChange={(type) => {
          if (isLeadType(type)) onChange({ ...values, type });
        }}
      />
      <Collapse isOpen={shouldShowStage}>
        <LeadSelectField
          id={`${idPrefix}-stage`}
          label={t("admin:leads.field.stage")}
          options={stageOptions}
          value={values.stage}
          refusal={refusalFor(fieldError, "stage")}
          openLeadPath={openLeadPath}
          isDisabled={isDisabled}
          onValueChange={(stage) => {
            if (isLeadStage(stage)) onChange({ ...values, stage });
          }}
        />
      </Collapse>
      <LeadTextField
        id={`${idPrefix}-location`}
        label={t("admin:leads.field.location")}
        placeholder={t("admin:leads.field.locationPlaceholder")}
        value={values.location}
        maxLength={LEAD_LOCATION_MAX}
        refusal={refusalFor(fieldError, "location")}
        openLeadPath={openLeadPath}
        isDisabled={isDisabled}
        onValueChange={(location) => onChange({ ...values, location })}
      />
    </div>
  );
}

/** The follow-up date, and the first note while `shouldShowNote` holds. */
function LeadFollowUpFields({
  idPrefix,
  values,
  onChange,
  fieldError,
  openLeadPath,
  isDisabled = false,
  shouldShowNote,
}: LeadFieldsProps & { shouldShowNote: boolean }) {
  const { t } = useTranslation();
  const followUpRefusal = refusalFor(fieldError, "followUpOn");
  const noteRefusal = refusalFor(fieldError, "note");
  const followUpRefusalId = `${idPrefix}-follow-up-refusal`;
  const noteRefusalId = `${idPrefix}-note-refusal`;

  return (
    <>
      <div className={styles.fieldBlock}>
        <FormField
          label={t("admin:leads.field.followUp")}
          helper={t("admin:leads.field.followUpHint")}
          className={styles.field}
        >
          <DatePicker
            mode="date"
            id={`${idPrefix}-follow-up`}
            label={t("admin:leads.field.followUp")}
            value={values.followUpOn}
            min={LEAD_FOLLOW_UP_MIN}
            max={LEAD_FOLLOW_UP_MAX}
            // The picker's own clear empties the date in the form alone; it
            // is saved with the other fields.
            clearable
            disabled={isDisabled}
            aria-invalid={followUpRefusal !== null || undefined}
            aria-describedby={
              followUpRefusal !== null ? followUpRefusalId : undefined
            }
            onChange={(followUpOn) => onChange({ ...values, followUpOn })}
          />
        </FormField>
        <LeadRefusalLine
          error={followUpRefusal}
          openLeadPath={openLeadPath}
          id={followUpRefusalId}
        />
      </div>
      <Collapse isOpen={shouldShowNote}>
        <div className={styles.fieldBlock}>
          <FormField
            label={t("admin:leads.field.firstNote")}
            helper={t("admin:leads.field.firstNoteHint")}
            className={styles.field}
          >
            <textarea
              id={`${idPrefix}-note`}
              rows={3}
              value={values.note}
              maxLength={LEAD_NOTE_MAX}
              disabled={isDisabled}
              aria-invalid={noteRefusal !== null || undefined}
              aria-describedby={
                noteRefusal !== null ? noteRefusalId : undefined
              }
              onChange={(event) =>
                onChange({ ...values, note: event.target.value })
              }
            />
          </FormField>
          <LeadRefusalLine
            error={noteRefusal}
            openLeadPath={openLeadPath}
            id={noteRefusalId}
          />
        </div>
      </Collapse>
    </>
  );
}

/**
 * Every field of a lead in four titled sections, in reading order: About
 * (name, type, the stage when shown, location), Contact (email, phone),
 * Links, and Follow-up (the date, and the first note when shown). Each
 * refusal shows under the field it names.
 */
export function LeadFormFields(
  props: LeadFieldsProps & {
    shouldShowStage: boolean;
    shouldShowNote: boolean;
  },
) {
  const { t } = useTranslation();
  const {
    idPrefix,
    values,
    onChange,
    fieldError,
    openLeadPath,
    isDisabled = false,
  } = props;

  return (
    <div className={styles.form}>
      <LeadFormSection heading={t("admin:leads.form.sectionAbout")}>
        <LeadTextField
          id={`${idPrefix}-name`}
          label={t("admin:leads.field.name")}
          value={values.name}
          maxLength={LEAD_NAME_MAX}
          isRequired
          refusal={refusalFor(fieldError, "name")}
          openLeadPath={openLeadPath}
          isDisabled={isDisabled}
          onValueChange={(name) => onChange({ ...values, name })}
        />
        <LeadKindFields {...props} />
      </LeadFormSection>
      <LeadFormSection heading={t("admin:leads.form.sectionContact")}>
        <LeadContactFields {...props} />
      </LeadFormSection>
      <LeadLinksField {...props} />
      <LeadFormSection heading={t("admin:leads.form.sectionFollowUp")}>
        <LeadFollowUpFields {...props} />
      </LeadFormSection>
    </div>
  );
}
