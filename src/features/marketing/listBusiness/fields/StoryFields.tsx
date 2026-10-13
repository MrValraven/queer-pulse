import { FormField } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import { listingKindOf } from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import { ListingHighlightPicker } from "../ListingHighlightPicker";
import {
  StepStoryAttributesField,
  StepStoryDescriptionField,
} from "../StepStoryFields";
import { InclusionPracticesField } from "./InclusionPracticesField";
import { LanguagesField } from "./LanguagesField";
import styles from "../ListBusinessPage.module.css";

/**
 * The story field body: tagline, the description, what's true (the
 * attribute picker), the three card highlights, the inclusion practices and
 * the languages spoken.
 *
 * Shared by the create wizard's step 2 pane (`StepStory`) and the owner
 * editor's Story section. Fragment, so each field stays a direct child of the
 * caller's `.stepBody` column.
 */
export function StoryFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.tagline}
        label={t("marketing:listBusiness.step2.taglineLabel")}
        required
        helper={
          <Translation
            i18nKey="marketing:listBusiness.step2.taglineHelper"
            components={{ em: <em /> }}
          />
        }
      >
        <input
          type="text"
          maxLength={120}
          placeholder={t(
            listingKindOf(draft) === "mobile"
              ? "marketing:listBusiness.step2.taglinePlaceholderMobile"
              : "marketing:listBusiness.step2.taglinePlaceholder",
          )}
          value={draft.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </FormField>

      <StepStoryDescriptionField form={form} />

      <StepStoryAttributesField form={form} />
      <ListingHighlightPicker form={form} />
      <InclusionPracticesField form={form} />
      <LanguagesField form={form} />
    </>
  );
}
