import { useId, type HTMLInputTypeAttribute, type ReactNode } from "react";
import { FiMail, FiPhone } from "react-icons/fi";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { LEAD_EMAIL_MAX, LEAD_PHONE_MAX } from "./api/leads.types";
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

/**
 * One titled group of lead fields: a quiet heading, then the fields. The
 * group takes its name from the heading, so a screen reader names it on the
 * way in. `describedBy` points the group at a line that belongs to all of
 * it, such as a refusal that names no single field.
 */
export function LeadFormSection({
  heading,
  describedBy,
  children,
}: {
  heading: string;
  describedBy?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <div
      className={styles.section}
      role="group"
      aria-labelledby={headingId}
      aria-describedby={describedBy}
    >
      <span id={headingId} className={styles.sectionHeading}>
        {heading}
      </span>
      {children}
    </div>
  );
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
  /** A leading icon drawn inside the input, as the link rows have. */
  icon?: ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
}

/**
 * One labelled text input with its refusal line below. `FormField` draws
 * the label and wires the id; the input points `aria-describedby` at the
 * refusal and turns `aria-invalid` while one shows. The input stays the
 * field's only child so that wiring holds, and a leading icon sits over it
 * from outside, level with the input at the bottom of the field.
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
  icon,
  isRequired = false,
  isDisabled = false,
}: LeadTextFieldProps) {
  const refusalId = `${id}-refusal`;
  const hasIcon = icon !== undefined;
  return (
    <div className={styles.fieldBlock}>
      <div className={styles.textFieldShell}>
        <FormField label={label} required={isRequired} className={styles.field}>
          <input
            id={id}
            type={type}
            className={[styles.textInput, hasIcon && styles.textInputWithIcon]
              .filter(Boolean)
              .join(" ")}
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
        {hasIcon ? (
          <span className={styles.textFieldIcon} aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <LeadRefusalLine
        error={refusal}
        openLeadPath={openLeadPath}
        id={refusalId}
      />
    </div>
  );
}

/**
 * How to reach the lead: email and phone, each with a leading icon. They
 * stack on a narrow form and sit side by side once it is wide enough.
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
    <div className={styles.pairGrid}>
      <LeadTextField
        id={`${idPrefix}-email`}
        type="email"
        label={t("admin:leads.field.email")}
        placeholder={t("admin:leads.form.emailPlaceholder")}
        icon={<FiMail />}
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
        placeholder={t("admin:leads.form.phonePlaceholder")}
        icon={<FiPhone />}
        value={values.phone}
        maxLength={LEAD_PHONE_MAX}
        refusal={refusalFor(fieldError, "phone")}
        openLeadPath={openLeadPath}
        isDisabled={isDisabled}
        onValueChange={(phone) => onChange({ ...values, phone })}
      />
    </div>
  );
}
