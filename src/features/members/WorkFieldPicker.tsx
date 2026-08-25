import { useId } from "react";
import { ChipSelect } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DISCIPLINES,
  professionsForFields,
} from "./memberDirectoryFilter.data";
import {
  toggleWorkField,
  toggleWorkProfession,
  type WorkFieldSelection,
} from "./workFieldPicker.data";
import styles from "./WorkFieldPicker.module.css";

interface WorkFieldPickerProps extends WorkFieldSelection {
  onChange: (next: WorkFieldSelection) => void;
  /** Class applied to the two visible sub-headings, so each host surface can
   *  render them in its own label style (the profile editor's uppercase field
   *  label, Settings' bold sub-head). Defaults to the picker's own. */
  headingClassName?: string;
  className?: string;
}

/**
 * The shared "what do you do" picker: broad field(s) of work, then the
 * professions within them. Used by the profile editor, the onboarding wizard
 * and Settings → Interests, so the `profession ⊆ discipline` invariant and the
 * chip vocabulary live in one place instead of drifting across three.
 *
 * Both levels are multi-select: real bios already describe more than one role
 * ("Dancer, model & venture builder"), so a single-select would under-fit from
 * day one. Professions stay hidden until a field is chosen — the flat pool is
 * ~70 chips, which is a wall, not a choice.
 *
 * Values are the ids the member directory filters on, so anything picked here
 * is immediately findable under "What they do" / "Profession" in /members.
 */
export function WorkFieldPicker({
  discipline,
  profession,
  onChange,
  headingClassName,
  className,
}: WorkFieldPickerProps) {
  const { t } = useTranslation();
  const uid = useId();
  const headingClass = headingClassName ?? styles.head;
  const selection = { discipline, profession };
  const professionOptions = professionsForFields(discipline).map((option) => ({
    value: option.id,
    label: t(option.labelKey),
  }));

  return (
    <div className={className}>
      <div className={headingClass} id={`${uid}-field`}>
        {t("members:workPicker.fieldHeading")}
      </div>
      <ChipSelect
        labelledBy={`${uid}-field`}
        options={DISCIPLINES.map((field) => ({
          value: field.id,
          label: t(field.labelKey),
        }))}
        selected={new Set(discipline)}
        onToggle={(fieldId) => onChange(toggleWorkField(selection, fieldId))}
      />

      <div className={styles.professionGroup}>
        <div className={headingClass} id={`${uid}-profession`}>
          {t("members:workPicker.professionHeading")}
        </div>
        {discipline.length > 0 ? (
          <ChipSelect
            labelledBy={`${uid}-profession`}
            options={professionOptions}
            selected={new Set(profession)}
            onToggle={(professionId) =>
              onChange(toggleWorkProfession(selection, professionId))
            }
          />
        ) : (
          <p className={styles.prompt}>
            {t("members:workPicker.professionPrompt")}
          </p>
        )}
      </div>
    </div>
  );
}
