import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import {
  PostOpportunityCommitments,
  PostOpportunityTasks,
  PostOpportunityTeamFields,
} from "./PostOpportunityRichSections";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Optional depth: the story, the tasks, the honest commitment, contact. */
export function PostOpportunityRichFields({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { t } = useTranslation();
  const { state, set } = form;

  return (
    <details className={styles.optional}>
      <summary className={styles.optionalSummary}>
        {t("marketing:postOpportunity.rich.summary")}
      </summary>

      <div className={styles.optionalBody}>
        <div className={styles.sectionHead}>
          {t("marketing:postOpportunity.rich.whyHeading")}
        </div>
        <FormField
          label={t("marketing:postOpportunity.rich.whyLabel")}
          helper={t("marketing:postOpportunity.rich.whyHelper")}
        >
          <textarea
            rows={3}
            value={state.why}
            onChange={(e) => set("why", e.target.value)}
            placeholder={t("marketing:postOpportunity.rich.whyPlaceholder")}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.rich.goodForLabel")}
          helper={t("marketing:postOpportunity.rich.goodForHelper")}
        >
          <textarea
            rows={3}
            value={state.goodFor}
            onChange={(e) => set("goodFor", e.target.value)}
            placeholder={t("marketing:postOpportunity.rich.goodForPlaceholder")}
          />
        </FormField>

        <PostOpportunityTasks form={form} />
        <PostOpportunityCommitments form={form} />
        <PostOpportunityTeamFields form={form} />
      </div>
    </details>
  );
}
