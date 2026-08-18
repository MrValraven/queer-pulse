import { type FormEvent } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PostOpportunityCoreFields } from "./PostOpportunityCoreFields";
import { PostOpportunityRichFields } from "./PostOpportunityRichFields";
import { POST_TIPS } from "./postVolunteerOpportunity.data";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import styles from "./PostVolunteerOpportunityPage.module.css";

/**
 * The single form both the create and edit flows render — same fields, same
 * layout, same tips sidebar (`PostVolunteerOpportunityPage`, the create/edit
 * gate). `editing` hides the two creation-only fields (team picker, contact
 * handle); the caller owns submit wiring and copy so create/edit differ only
 * in labels, submit handler, and cancel target.
 */
export function PostVolunteerOpportunityForm({
  form,
  editing = false,
  onSubmit,
  submitting,
  submitLabel,
  submittingLabel,
  cancelTo,
}: {
  form: PostOpportunityForm;
  editing?: boolean;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  cancelTo: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <PostOpportunityCoreFields form={form} />
        <PostOpportunityRichFields form={form} editing={editing} />

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? submittingLabel : submitLabel}
            {!submitting && <FiArrowRight aria-hidden />}
          </Button>
          <Button variant="ghost" to={cancelTo}>
            {t("marketing:postOpportunity.actions.cancel")}
          </Button>
        </div>
      </form>

      <aside className={styles.sidebar}>
        {POST_TIPS.map((tip) => (
          <div className={styles.tipCard} key={tip.titleKey}>
            <div className={styles.tipTitle}>{t(tip.titleKey)}</div>
            <div className={styles.tipBody}>{t(tip.bodyKey)}</div>
          </div>
        ))}
      </aside>
    </div>
  );
}
