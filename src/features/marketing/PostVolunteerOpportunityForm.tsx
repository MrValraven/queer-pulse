import { useId, useRef, type FormEvent } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { focusFirstErrorAfterRender } from "../../shared/lib/focusFirstError";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MissingRequiredFields } from "./MissingRequiredFields";
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
 *
 * Submit is blocked until every required field is filled: the button reads as
 * disabled and a "still missing" list under it names each field that is
 * holding it back, each one clickable to jump to that field. The block lives
 * here rather than in either flow so create and edit behave identically.
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
  const formRef = useRef<HTMLFormElement>(null);
  const missingId = `${useId()}-missing`;
  const incomplete = form.missingFields.length > 0;

  /**
   * The submit button is `aria-disabled` rather than `disabled` while the form
   * is incomplete (the repo's convention — see `Button.module.css`): it looks
   * disabled but stays focusable and clickable, so a keyboard or screen-reader
   * user who presses it gets an answer instead of silence. The answer is the
   * inline errors plus focus on the first field still missing.
   */
  const handleSubmit = (e: FormEvent) => {
    if (incomplete || submitting) {
      e.preventDefault();
      if (submitting) return;
      form.markTouched();
      focusFirstErrorAfterRender(formRef.current);
      return;
    }
    onSubmit(e);
  };

  return (
    <div className={styles.layout}>
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <PostOpportunityCoreFields form={form} />
        <PostOpportunityRichFields form={form} editing={editing} />

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            aria-disabled={incomplete || submitting}
            aria-describedby={incomplete ? missingId : undefined}
            aria-busy={submitting}
          >
            {submitting ? submittingLabel : submitLabel}
            {!submitting && <FiArrowRight aria-hidden />}
          </Button>
          <Button variant="ghost" to={cancelTo}>
            {t("marketing:postOpportunity.actions.cancel")}
          </Button>
        </div>

        <MissingRequiredFields
          id={missingId}
          fields={form.missingFields}
          onReveal={form.markTouched}
        />
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
