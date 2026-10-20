import { DatePicker } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinRefinedField } from "./SkinRefinedField";

/** The stored shape of a `date` control's day. */
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A `date` control (the next books opening): the shared day picker in the
 * chapter's field frame, with its label and helper. A picked day stores as
 * `YYYY-MM-DD`; the picker's Clear button stores "". A stored value of any
 * other shape shows as no day picked, so the owner can pick one over it.
 */
export function SkinDateControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const stored = editor.getValue(control.path);
  const day =
    typeof stored === "string" && DAY_PATTERN.test(stored) ? stored : null;

  return (
    <SkinRefinedField
      label={t(control.labelKey)}
      isLabelHidden={isLabelHidden}
      helper={control.helperKey ? t(control.helperKey) : undefined}
      helperTone={control.helperTone}
      isNarrow={control.size === "narrow"}
    >
      {(field) => (
        <DatePicker
          mode="date"
          id={field.controlId}
          labelledBy={field.labelId}
          aria-describedby={field.describedBy}
          value={day}
          clearable
          onChange={(next) => editor.setValue(control.path, next ?? "")}
        />
      )}
    </SkinRefinedField>
  );
}
