import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinBlockControl,
  SkinItemFieldDescriptor,
  SkinSelectOption,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinAutoGrowTextarea } from "./SkinAutoGrowTextarea";

/** Resolve a descriptor's option list into `Select` options. */
function useSelectOptions(options: SkinSelectOption[] | undefined) {
  const { t } = useTranslation();
  return (options ?? []).map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
}

interface SkinSelectControlProps {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}

/**
 * A `select` control of an object block (e.g. `therapist.status`). Stores the
 * chosen option's string value at the control's dot-path. While nothing is
 * stored it shows `defaultValue`, the same value the public page assumes.
 * The generic page-blocks editor renders it in the FormField design; no
 * therapist chapter declares a `select`.
 */
export function SkinSelectControl({ control, editor }: SkinSelectControlProps) {
  const { t } = useTranslation();
  const options = useSelectOptions(control.options);
  const raw = editor.getValue(control.path);
  const value = typeof raw === "string" ? raw : (control.defaultValue ?? null);

  return (
    <FormField
      label={t(control.labelKey)}
      helper={control.helperKey ? t(control.helperKey) : undefined}
    >
      <Select
        options={options}
        value={value}
        placeholder={
          control.placeholderKey ? t(control.placeholderKey) : undefined
        }
        onChange={(next) => editor.setValue(control.path, next ?? "")}
      />
    </FormField>
  );
}

interface SkinItemFieldInputProps {
  field: SkinItemFieldDescriptor;
  value: string;
  onChange: (value: string) => void;
}

/** One field of an `objectList` entry in the generic page-blocks editor: a
 *  select when the descriptor lists `options`, else a single-line input or
 *  a textarea, each in a FormField. The therapist chapters' entries use
 *  `SkinRefinedItemFieldInput`. */
export function SkinItemFieldInput({
  field,
  value,
  onChange,
}: SkinItemFieldInputProps) {
  const { t } = useTranslation();
  const options = useSelectOptions(field.options);
  const placeholder = field.placeholderKey
    ? t(field.placeholderKey)
    : undefined;

  if (field.options) {
    return (
      <FormField label={t(field.labelKey)}>
        <Select
          options={options}
          value={value || null}
          placeholder={placeholder}
          onChange={(next) => onChange(next ?? "")}
        />
      </FormField>
    );
  }

  return (
    <FormField label={t(field.labelKey)}>
      {field.multiline ? (
        <SkinAutoGrowTextarea
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FormField>
  );
}
