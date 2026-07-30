import { FormField, SegmentedControl } from "../../shared/components/ui";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";

/** Top-level start method: seed from a kind template, start blank, or copy one
 *  of the owner's existing personas. "Copy" is disabled when the owner has no
 *  personas yet (nothing to copy). */
export type StartMethod = "template" | "blank" | "copy";

export function StartMethodPicker({
  method,
  onChange,
  copyDisabled,
  t,
}: {
  method: StartMethod;
  onChange: (method: StartMethod) => void;
  copyDisabled: boolean;
  t: TranslationApi["t"];
}) {
  const choices: Array<{ value: StartMethod; label: string; disabled?: boolean }> = [
    { value: "template", label: t("subprofiles:start.template") },
    { value: "blank", label: t("subprofiles:start.blank") },
    { value: "copy", label: t("subprofiles:start.copy"), disabled: copyDisabled },
  ];
  const current = choices.find((choice) => choice.value === method)!;
  const disabledLabels = choices
    .filter((choice) => choice.disabled)
    .map((choice) => choice.label);
  return (
    <FormField
      label={t("subprofiles:start.label")}
      helper={
        copyDisabled ? t("subprofiles:start.copyDisabledHelper") : t("subprofiles:start.helper")
      }
    >
      <SegmentedControl
        fullWidth
        options={choices.map((choice) => choice.label)}
        disabledOptions={disabledLabels}
        value={current.label}
        onChange={(value) => {
          const match = choices.find((choice) => choice.label === value);
          if (match && !match.disabled) onChange(match.value);
        }}
      />
    </FormField>
  );
}
