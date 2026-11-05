import type { HTMLInputTypeAttribute } from "react";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  LEAD_EMAIL_MAX,
  LEAD_LOCATION_MAX,
  LEAD_PHONE_MAX,
} from "./api/leads.types";
import type { LeadFieldError, LeadFormField } from "./leadForm.model";
import type { LeadFieldsProps } from "./LeadFormFields";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadForm.module.css";

/** The refusal that belongs under `field`, or null. */
function refusalFor(
  fieldError: LeadFieldError | null,
  field: LeadFormField,
): LeadFieldError | null {
  return fieldError?.field === field ? fieldError : null;
}

interface LeadTextFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (text: string) => void;
  refusal: LeadFieldError | null;
  openLeadPath: (leadId: string) => string;
  maxLength: number;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

/**
 * One labelled text input with its refusal line below. `FormField` draws
 * the label and wires the id; the input points `aria-describedby` at the
 * refusal and turns `aria-invalid` while one shows.
 */
export function LeadTextField({
  id,
  label,
  value,
  onValueChange,
  refusal,
  openLeadPath,
  maxLength,
  type = "text",
  placeholder,
  isRequired = false,
  isDisabled = false,
}: LeadTextFieldProps) {
  const refusalId = `${id}-refusal`;
  return (
    <div className={styles.fieldBlock}>
      <FormField label={label} required={isRequired} className={styles.field}>
        <input
          id={id}
          type={type}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          disabled={isDisabled}
          aria-invalid={refusal !== null || undefined}
          aria-describedby={refusal !== null ? refusalId : undefined}
          onChange={(event) => onValueChange(event.target.value)}
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
 * Where to find the lead: location, email and phone. They stack one per row
 * on a phone and sit three across once the form is wide enough; the shell
 * is its own size container, so the grid follows whatever form holds it.
 */
export function LeadContactFields({
  idPrefix,
  values,
  onChange,
  fieldError,
  openLeadPath,
  isDisabled = false,
}: LeadFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.contactShell}>
      <div className={styles.contactGrid}>
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
        <LeadTextField
          id={`${idPrefix}-email`}
          type="email"
          label={t("admin:leads.field.email")}
          value={values.email}
          maxLength={LEAD_EMAIL_MAX}
          refusal={refusalFor(fieldError, "email")}
          openLeadPath={openLeadPath}
          isDisabled={isDisabled}
          onValueChange={(email) => onChange({ ...values, email })}
        />
        <LeadTextField
          id={`${idPrefix}-phone`}
          type="tel"
          label={t("admin:leads.field.phone")}
          value={values.phone}
          maxLength={LEAD_PHONE_MAX}
          refusal={refusalFor(fieldError, "phone")}
          openLeadPath={openLeadPath}
          isDisabled={isDisabled}
          onValueChange={(phone) => onChange({ ...values, phone })}
        />
      </div>
    </div>
  );
}
