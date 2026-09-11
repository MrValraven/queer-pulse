import { useId, useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextArea } from "../CreateGatheringFields";
import { ThemeChips } from "../fields/ThemeChips";
import { allowedDetailKeys } from "../gatheringCatalog";
import type { GatheringForm } from "../useGatheringForm";
import { CoverImageField } from "./CoverImageField";
import { FormatDetailsFields } from "./FormatDetailsFields";
import { FormatPicker } from "./FormatPicker";
import { TitleField } from "./TitleField";
import {
  DESCRIPTION_CARD_BUDGET,
  MAX_DESCRIPTION_STORAGE_LENGTH,
} from "./whatChapter.data";
import styles from "./WhatChapter.module.css";

/** The one or two questions the chosen family raises, under the picker. Four
 *  families ask nothing and render nothing. Each question is its own v2 field
 *  with its own visible label, so the group is named for assistive tech
 *  only. */
function FormatDetailsBlock({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  if (!form.family || allowedDetailKeys(form.family).length === 0) return null;
  return (
    <div
      role="group"
      aria-label={t("gatherings:create.step3.formatDetailsLabel")}
    >
      <FormatDetailsFields
        variant="wizard"
        family={form.family}
        details={form.formatDetails}
        onChange={form.setFormatDetail}
      />
    </div>
  );
}

/** The description (ruling F2). Board cards show about the first
 *  `DESCRIPTION_CARD_BUDGET` characters, so the counter reads against that
 *  budget and turns to a warning tone past it, with a hint saying why. The
 *  text is kept whole up to the backend's own cap and publishes as it is.
 *  Crossing the budget while typing is announced once through a polite
 *  status line, since a hint that appears mid-typing is not read out on its
 *  own. */
function DescriptionField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const textareaId = `${fieldId}-description`;
  const [budgetAnnouncement, setBudgetAnnouncement] = useState("");
  const descriptionLength = form.description.length;
  const isOverBudget = descriptionLength > DESCRIPTION_CARD_BUDGET;
  const counterText = `${descriptionLength}/${DESCRIPTION_CARD_BUDGET}`;
  const overBudgetHint = t("gatherings:create.v2.what.descriptionOverBudget", {
    budget: DESCRIPTION_CARD_BUDGET,
  });
  return (
    <Field
      label={t("gatherings:create.step1.descLabel")}
      htmlFor={textareaId}
      isOptional
      count={
        isOverBudget ? (
          <span className={styles.countOverBudget}>{counterText}</span>
        ) : (
          counterText
        )
      }
      hint={isOverBudget ? overBudgetHint : undefined}
    >
      <TextArea
        id={textareaId}
        maxLength={MAX_DESCRIPTION_STORAGE_LENGTH}
        aria-describedby={isOverBudget ? `${textareaId}-hint` : undefined}
        placeholder={t("gatherings:create.step1.descPlaceholder")}
        value={form.description}
        onChange={(event) => {
          const nextDescription = event.target.value;
          const isNextOverBudget =
            nextDescription.length > DESCRIPTION_CARD_BUDGET;
          // Only a crossing changes the status text: upward it carries the
          // hint, downward it empties quietly, so the next crossing is read
          // again and ordinary keystrokes stay silent.
          if (isNextOverBudget !== isOverBudget) {
            setBudgetAnnouncement(isNextOverBudget ? overBudgetHint : "");
          }
          form.setDescription(nextDescription);
        }}
      />
      <p role="status" className="visuallyHidden">
        {budgetAnnouncement}
      </p>
    </Field>
  );
}

/** Up to three theme chips. A theme the family's own details already ask
 *  about is hidden (ruling R6). */
function ThemesField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const labelId = useId();
  return (
    <Field
      label={t("gatherings:create.v2.what.themesLabel")}
      labelId={labelId}
      isOptional
      hint={t("gatherings:create.v2.what.themesHint")}
    >
      <ThemeChips
        family={form.family}
        selectedThemes={form.themes}
        onToggle={form.toggleTheme}
        labelledBy={labelId}
        describedBy={`${labelId}-hint`}
      />
    </Field>
  );
}

/**
 * Chapter 1, "What are you hosting?": the format (with the family's own
 * questions under it), the title, a short description, the cover and the
 * themes. The shell supplies the intro and the Continue footer.
 */
export function WhatChapter({ form }: { form: GatheringForm }) {
  return (
    <>
      <FormatPicker form={form} />
      <FormatDetailsBlock form={form} />
      <TitleField form={form} />
      <DescriptionField form={form} />
      <CoverImageField form={form} />
      <ThemesField form={form} />
    </>
  );
}
