import { useId } from "react";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR } from "./listBusiness.data";
import { ListingDescriptionEditor } from "./ListingDescriptionEditor";
import { ListingAttributePicker } from "./ListingAttributePicker";
import { isNewListingDraft } from "./listingFactSummaries";
import { listingKindOf, type ListingKind } from "./listingMobile.data";
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
      helper={t(
        // An out-and-about listing has no door to walk in at.
        listingKindOf(draft) === "mobile"
          ? "marketing:listBusiness.step2.descriptionHelperMobile"
          : "marketing:listBusiness.step2.descriptionHelper",
      )}
    >
      <ListingDescriptionEditor
        paragraphs={draft.whatItIs}
        placeholder={t(
          listingKindOf(draft) === "mobile"
            ? "marketing:listBusiness.step2.descriptionPlaceholderMobile"
            : "marketing:listBusiness.step2.descriptionPlaceholder",
        )}
        onChange={setDescription}
      />
    </FormField>
  );
}

/** The label names what the attributes describe for this kind. */
const ATTRIBUTE_LABEL_KEYS: Record<ListingKind, string> = {
  place: "marketing:listBusiness.step2.attributes.label",
  mobile: "marketing:listBusiness.step2.attributes.labelMobile",
  online: "marketing:listBusiness.step2.attributes.labelOnline",
};

/** "What's true about this place": every attribute the listing's kind and
 *  categories are offered, uncapped (see ListingAttributePicker). */
export function StepStoryAttributesField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, toggleAttribute } = form;
  const kind = listingKindOf(draft);
  // The picker is a custom child FormField leaves unwired, so the search
  // box names the helper itself.
  const helperId = useId();
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.attributes}
      label={t(ATTRIBUTE_LABEL_KEYS[kind])}
      helper={t("marketing:listBusiness.step2.attributes.helper")}
      helperId={helperId}
    >
      <ListingAttributePicker
        attributes={draft.attributes ?? []}
        kind={kind}
        cats={draft.cats}
        describedBy={helperId}
        isNewDraft={isNewListingDraft(draft)}
        onToggle={toggleAttribute}
      />
    </FormField>
  );
}
