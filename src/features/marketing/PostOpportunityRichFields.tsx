import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import {
  PostOpportunityCommitments,
  PostOpportunityTasks,
  PostOpportunityTeamFields,
} from "./PostOpportunityRichSections";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Optional depth: the tasks, the honest commitment, team and contact.
 *  `editing` hides the two creation-only fields (team picker, contact
 *  handle); see `PostOpportunityTeamFields`. */
export function PostOpportunityRichFields({
  form,
  editing = false,
}: {
  form: PostOpportunityForm;
  editing?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <details className={styles.optional}>
      <summary className={styles.optionalSummary}>
        <FiChevronDown className={styles.optionalChevron} aria-hidden />
        {t("marketing:postOpportunity.rich.summary")}
      </summary>

      <div className={styles.optionalBody}>
        <PostOpportunityTasks form={form} />
        <PostOpportunityCommitments form={form} />
        <PostOpportunityTeamFields form={form} editing={editing} />
      </div>
    </details>
  );
}
