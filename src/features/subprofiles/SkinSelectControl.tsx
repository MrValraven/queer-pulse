import { useRef } from "react";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinBlockControl,
  SkinItemFieldDescriptor,
  SkinSelectOption,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  IS_FIELD_SIZING_SUPPORTED,
  useAutoGrowFallback,
} from "./useAutoGrowTextarea";
import listStyles from "./SkinListControls.module.css";

/** Resolve a descriptor's option list into `Select` options. */
function useSelectOptions(options: SkinSelectOption[] | undefined) {
  const { t } = useTranslation();
  return (options ?? []).map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
}

/**
 * A `select` control of an object block (e.g. `therapist.status`). Stores the
 * chosen option's string value at the control's dot-path. While nothing is
 * stored it shows `defaultValue`, the same value the public page assumes.
 */
export function SkinSelectControl({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
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

/** A multi-line item field (an FAQ answer, a step's body, a note) that
 *  grows with its text from a three-row minimum, so nothing is clipped.
 *  It forwards FormField's injected `id` and `aria-*` onto the textarea. */
function SkinAutoGrowTextarea({
  value,
  placeholder,
  onChange,
  ...wiring
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoGrowFallback(textareaRef, value);
  return (
    <textarea
      {...wiring}
      ref={textareaRef}
      className={listStyles.autoGrowTextarea}
      rows={IS_FIELD_SIZING_SUPPORTED ? undefined : 3}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
SkinAutoGrowTextarea.formFieldControl = true;

/** One field of an `objectList` entry: a select when the descriptor lists
 *  `options`, else a single-line input or a textarea. */
export function SkinItemFieldInput({
  field,
  value,
  onChange,
}: {
  field: SkinItemFieldDescriptor;
  value: string;
  onChange: (value: string) => void;
}) {
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
