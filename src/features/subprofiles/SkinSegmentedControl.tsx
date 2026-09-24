import {
  FormField,
  SegmentedControl,
  type SegmentOption,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl, SkinOptionTone } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import styles from "./SkinScalarControls.module.css";

const TONE_CLASS: Record<SkinOptionTone, string | undefined> = {
  jade: styles.toneJade,
  amber: styles.toneAmber,
  muted: styles.toneMuted,
};

/** A set this long, with any label past this length, stacks one option per
 *  row: "Not taking new clients" would otherwise wrap alone onto a second
 *  row of a narrow card. Short sets (Yes / No / Not said) stay side by side. */
const STACK_MIN_OPTIONS = 3;
const STACK_LABEL_LENGTH = 14;

/** The status dot before a toned option's label: full strength on the
 *  chosen segment, faded on the others. */
function ToneDot({
  tone,
  isActive,
}: {
  tone: SkinOptionTone;
  isActive: boolean;
}) {
  return (
    <span
      className={[
        styles.toneDot,
        TONE_CLASS[tone],
        isActive && styles.toneDotActive,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

/**
 * A `segmented` control (the therapist's "Taking new clients" status, the
 * online answer). Stores the chosen option's string value at the control's
 * path; while nothing is stored it shows `defaultValue`, the same value the
 * public page assumes. An option's value may be "" (the "not said" answer),
 * which works as both a key and a value here. Under 480px the tray fills
 * the row (see `.segmented` in the CSS module); long sets stack one option per row
 * (see STACK_MIN_OPTIONS).
 */
export function SkinSegmentedControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const label = t(control.labelKey);
  const stored = editor.getValue(control.path);
  const value =
    typeof stored === "string" ? stored : (control.defaultValue ?? "");

  const segments: SegmentOption[] = (control.options ?? []).map((option) => ({
    value: option.value,
    label: t(option.labelKey),
    icon: option.tone ? (
      <ToneDot tone={option.tone} isActive={option.value === value} />
    ) : undefined,
  }));
  const isStacked =
    segments.length >= STACK_MIN_OPTIONS &&
    segments.some(
      (segment) =>
        typeof segment.label === "string" &&
        segment.label.length > STACK_LABEL_LENGTH,
    );

  return (
    <FormField
      label={isLabelHidden ? undefined : label}
      helper={control.helperKey ? t(control.helperKey) : undefined}
    >
      <SegmentedControl
        options={segments}
        value={value}
        onChange={(next) => {
          // The shared control reports a tap on the active option too.
          // Writing it over an unset value would mark the page dirty (and
          // change the status on save), so a repeat tap does nothing.
          if (next !== value) editor.setValue(control.path, next);
        }}
        label={label}
        className={isStacked ? styles.segmentedStacked : styles.segmented}
      />
    </FormField>
  );
}
