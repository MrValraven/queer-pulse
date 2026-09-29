import { useMemo } from "react";
import type { SelectProps } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  JOB_FIELD_GROUPS,
  PROFESSION_IDS_BY_FIELD,
  fieldLabelKey as workFieldLabelKey,
  jobFieldGroupLabelKey,
  professionBelongsToField,
  professionLabelKey as workProfessionLabelKey,
} from "../members/workTaxonomy.data";

type SingleSelectProps = Extract<SelectProps, { multiple?: false }>;

/** The props both job forms spread onto their field and profession Selects. */
type JobTaxonomySelectProps = Pick<
  SingleSelectProps,
  | "value"
  | "onChange"
  | "options"
  | "searchable"
  | "clearable"
  | "disabled"
  | "placeholder"
  | "searchPlaceholder"
>;

export interface JobFieldValue {
  /** "" means none chosen. */
  fieldId: string;
  /** "" means none. */
  professionId: string;
}

interface UseJobFieldSelectPropsArgs extends JobFieldValue {
  onChange: (next: JobFieldValue) => void;
}

/**
 * Owns the job taxonomy pickers for both the post wizard and the edit page:
 * the field options (grouped by `JOB_FIELD_GROUPS`, searchable by the
 * professions inside each field), the profession options scoped to the chosen
 * field, and the one rule tying them together: picking a field the current
 * profession does not belong to clears the profession. Each caller wraps the
 * returned props in its own label markup.
 */
export function useJobFieldSelectProps({
  fieldId,
  professionId,
  onChange,
}: UseJobFieldSelectPropsArgs) {
  const { t } = useTranslation();

  const fieldOptions = useMemo(
    () =>
      JOB_FIELD_GROUPS.flatMap((group) =>
        group.fieldIds.map((groupFieldId) => ({
          value: groupFieldId,
          label: t(workFieldLabelKey(groupFieldId)),
          group: t(jobFieldGroupLabelKey(group.id)),
          keywords: (PROFESSION_IDS_BY_FIELD[groupFieldId] ?? [])
            .map((id) => t(workProfessionLabelKey(id)))
            .join(" "),
        })),
      ),
    [t],
  );

  const professionOptions = useMemo(
    () =>
      (PROFESSION_IDS_BY_FIELD[fieldId] ?? []).map((id) => ({
        value: id,
        label: t(workProfessionLabelKey(id)),
      })),
    [fieldId, t],
  );

  function handleFieldChange(nextFieldId: string | null) {
    const nextField = nextFieldId ?? "";
    const shouldKeepProfession =
      professionId !== "" &&
      nextField !== "" &&
      professionBelongsToField(professionId, nextField);
    onChange({
      fieldId: nextField,
      professionId: shouldKeepProfession ? professionId : "",
    });
  }

  const fieldSelectProps: JobTaxonomySelectProps = {
    value: fieldId || null,
    onChange: handleFieldChange,
    options: fieldOptions,
    searchable: true,
    placeholder: t("economy:postJob.field.fieldPlaceholder"),
    searchPlaceholder: t("economy:postJob.field.fieldSearch"),
  };

  const professionSelectProps: JobTaxonomySelectProps = {
    value: professionId || null,
    onChange: (nextProfessionId) =>
      onChange({ fieldId, professionId: nextProfessionId ?? "" }),
    options: professionOptions,
    searchable: true,
    clearable: true,
    disabled: !fieldId,
    placeholder: t("economy:postJob.field.professionPlaceholder"),
  };

  return { fieldSelectProps, professionSelectProps } as const;
}
