import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR } from "./listBusiness.data";
import { ListingDescriptionEditor } from "./ListingDescriptionEditor";
import { ListingTagPicker } from "./ListingTagPicker";
import type { ListingForm } from "./useListingForm";
import styles from "./ListBusinessPage.module.css";

/** The description: one markdown-lite field with a formatting toolbar. The
 *  form stores it one `whatItIs` entry per paragraph. */
export function StepStoryDescriptionField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, setDescription } = form;
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.whatItIs}
      label={t("marketing:listBusiness.step2.descriptionLabel")}
      required
      helper={t("marketing:listBusiness.step2.descriptionHelper")}
    >
      <ListingDescriptionEditor
        paragraphs={draft.whatItIs}
        placeholder={t("marketing:listBusiness.step2.descriptionPlaceholder")}
        onChange={setDescription}
      />
    </FormField>
  );
}

/** The tag field: pick up to six tags from the curated vocabulary (see
 *  ListingTagPicker). */
export function StepStoryTagsField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, addTag, removeTag } = form;
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.tags}
      label={t("marketing:listBusiness.step2.tagsLabel")}
    >
      <ListingTagPicker tags={draft.tags} onAdd={addTag} onRemove={removeTag} />
    </FormField>
  );
}
