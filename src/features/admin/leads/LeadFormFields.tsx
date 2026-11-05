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
  LEAD_NAME_MAX,
  LEAD_NOTE_MAX,
  LEAD_STAGES,
  LEAD_TYPES,
  isLeadStage,
  isLeadType,
} from "./api/leads.types";
import { LeadContactFields, LeadTextField } from "./LeadContactFields";
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

/** The type select, and the stage select beside it while `shouldShowStage`
 *  holds (the Add lead dialog; the lead page saves its stage on its own). */
function LeadTypeStageFields({
  idPrefix,
  values,
  onChange,
  fieldError,
  openLeadPath,
  isDisabled = false,
  shouldShowStage,
}: LeadFieldsProps & { shouldShowStage: boolean }) {
  const { t } = useTranslation();
  const typeRefusal = refusalFor(fieldError, "type");
  const stageRefusal = refusalFor(fieldError, "stage");
  const typeRefusalId = `${idPrefix}-type-refusal`;
  const stageRefusalId = `${idPrefix}-stage-refusal`;
  const typeOptions = LEAD_TYPES.map((type) => ({
    value: type,
    label: t(LEAD_TYPE_LABEL_KEY[type]),
  }));
  const stageOptions = LEAD_STAGES.map((stage) => ({
    value: stage,
    label: t(LEAD_STAGE_LABEL_KEY[stage]),
  }));

  return (
    <div className={styles.pairGrid}>
      <div className={styles.fieldBlock}>
        <FormField
          label={t("admin:leads.field.type")}
          required
          className={styles.field}
        >
          <Select
            id={`${idPrefix}-type`}
            label={t("admin:leads.field.type")}
            placeholder={t("admin:leads.field.typePlaceholder")}
            options={typeOptions}
            value={values.type}
            disabled={isDisabled}
            aria-invalid={typeRefusal !== null || undefined}
            aria-describedby={typeRefusal !== null ? typeRefusalId : undefined}
            onChange={(type) => {
              if (isLeadType(type)) onChange({ ...values, type });
            }}
          />
        </FormField>
        <LeadRefusalLine
          error={typeRefusal}
          openLeadPath={openLeadPath}
          id={typeRefusalId}
        />
      </div>
      <Collapse isOpen={shouldShowStage}>
        <div className={styles.fieldBlock}>
          <FormField
            label={t("admin:leads.field.stage")}
            className={styles.field}
          >
            <Select
              id={`${idPrefix}-stage`}
              label={t("admin:leads.field.stage")}
              options={stageOptions}
              value={values.stage}
              disabled={isDisabled}
              aria-invalid={stageRefusal !== null || undefined}
              aria-describedby={
                stageRefusal !== null ? stageRefusalId : undefined
              }
              onChange={(stage) => {
                if (isLeadStage(stage)) onChange({ ...values, stage });
              }}
            />
          </FormField>
          <LeadRefusalLine
            error={stageRefusal}
            openLeadPath={openLeadPath}
            id={stageRefusalId}
          />
        </div>
      </Collapse>
    </div>
  );
}

/**
 * Every field of a lead, in reading order: name, type (and stage when
 * shown), location, email and phone, links, the follow-up date, and the
 * first note when shown. Each refusal shows under the field it names.
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
    shouldShowNote,
  } = props;
  const followUpRefusal = refusalFor(fieldError, "followUpOn");
  const noteRefusal = refusalFor(fieldError, "note");
  const followUpRefusalId = `${idPrefix}-follow-up-refusal`;
  // Only the Add lead dialog (the one form with a first note) clears the
  // date inside the picker; the lead page has its own Clear follow-up,
  // which saves at once, so a second clear there would act differently.
  const isFollowUpClearable = shouldShowNote;
  const noteRefusalId = `${idPrefix}-note-refusal`;

  return (
    <div className={styles.form}>
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
      <LeadTypeStageFields {...props} />
      <LeadContactFields {...props} />
      <LeadLinksField {...props} />
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
            clearable={isFollowUpClearable}
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
    </div>
  );
}
