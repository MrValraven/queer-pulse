import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import {
  MAX_GOOD_FOR_COUNT,
  MAX_GOOD_FOR_LENGTH,
  MAX_WHY_COUNT,
  MAX_WHY_LENGTH,
} from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** The story behind the role: why it matters and who fits. Always visible;
 *  both fields optional. */
export function PostOpportunityWhyFields({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { t } = useTranslation();
  const { state, set } = form;

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.rich.whyHeading")}
      </div>
      <FormField
        label={t("marketing:postOpportunity.rich.whyLabel")}
        helper={t("marketing:postOpportunity.rich.whyHelper", {
          maxCount: MAX_WHY_COUNT,
          maxLength: MAX_WHY_LENGTH,
        })}
      >
        <textarea
          className={styles.textarea}
          rows={3}
          value={state.why}
          onChange={(e) => set("why", e.target.value)}
          placeholder={t("marketing:postOpportunity.rich.whyPlaceholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:postOpportunity.rich.goodForLabel")}
        helper={t("marketing:postOpportunity.rich.goodForHelper", {
          maxCount: MAX_GOOD_FOR_COUNT,
          maxLength: MAX_GOOD_FOR_LENGTH,
        })}
      >
        <textarea
          className={styles.textarea}
          rows={3}
          value={state.goodFor}
          onChange={(e) => set("goodFor", e.target.value)}
          placeholder={t("marketing:postOpportunity.rich.goodForPlaceholder")}
        />
      </FormField>
    </>
  );
}
