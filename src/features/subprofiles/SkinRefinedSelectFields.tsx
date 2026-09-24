import { useId } from "react";
import { Select } from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinItemFieldDescriptor,
  SkinSelectOption,
} from "./skinBlockFields.data";
import { SkinAutoGrowTextarea } from "./SkinAutoGrowTextarea";
import { refinedExample, refinedSurfaceClassName } from "./refinedFieldSurface";
import styles from "./SkinRefinedList.module.css";

/** A descriptor's option list as `Select` options. */
function toSelectOptions(
  translate: TFunction,
  options: SkinSelectOption[] | undefined,
) {
  return (options ?? []).map((option) => ({
    value: option.value,
    label: translate(option.labelKey),
  }));
}

/**
 * One field under a chapter entry's title (`SkinEntriesControl`), its
 * sentence-case label above the refined surface. The entry's own card slot
 * already carries the fill check, so each field here only shows its own
 * empty or filled surface. A select placeholder is an instruction ("Choose
 * a kind"), so it shows plain, without the "e.g." prefix; its trigger sits
 * on paper.
 */
export function SkinRefinedItemFieldInput({
  field,
  value,
  onChange,
}: {
  field: SkinItemFieldDescriptor;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const controlId = useId();
  const isEmpty = value.trim() === "";
  const placeholderText = field.placeholderKey
    ? t(field.placeholderKey)
    : undefined;
  const examplePlaceholder = placeholderText
    ? refinedExample(t, placeholderText)
    : undefined;

  return (
    <div className={styles.itemField}>
      <label htmlFor={controlId} className={styles.itemLabel}>
        {t(field.labelKey)}
      </label>
      {field.options ? (
        <Select
          id={controlId}
          className={styles.select}
          options={toSelectOptions(t, field.options)}
          value={value || null}
          placeholder={placeholderText}
          onChange={(next) => onChange(next ?? "")}
        />
      ) : field.multiline ? (
        <SkinAutoGrowTextarea
          id={controlId}
          className={`${refinedSurfaceClassName({ isMultiline: true, isEmpty })} ${styles.autoGrow}`}
          value={value}
          placeholder={examplePlaceholder}
          onChange={onChange}
        />
      ) : (
        <input
          id={controlId}
          className={refinedSurfaceClassName({ isEmpty })}
          value={value}
          placeholder={examplePlaceholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
