import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinRefinedField } from "./SkinRefinedField";

/**
 * A `toggle` control (private studio, refundable deposit): the shared switch
 * in the chapter's field frame, with its label and helper. Switched on it
 * stores `true`; switched off it removes the key, since an absent boolean
 * reads `false` on the page. The frame's `<label htmlFor>` points at the
 * switch, so a tap on the visible label flips it too.
 */
export function SkinToggleControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const isOn = editor.getValue(control.path) === true;
  const label = t(control.labelKey);

  return (
    <SkinRefinedField
      label={label}
      isLabelHidden={isLabelHidden}
      helper={control.helperKey ? t(control.helperKey) : undefined}
      helperTone={control.helperTone}
    >
      {(field) => (
        <Toggle
          id={field.controlId}
          label={label}
          checked={isOn}
          onChange={(isChecked) =>
            editor.setValue(control.path, isChecked ? true : undefined)
          }
        />
      )}
    </SkinRefinedField>
  );
}
