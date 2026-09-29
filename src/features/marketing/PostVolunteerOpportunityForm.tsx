import { useId, useRef, type FormEvent } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { focusFirstErrorAfterRender } from "../../shared/lib/focusFirstError";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MissingRequiredFields } from "./MissingRequiredFields";
import { PostOpportunityCoreFields } from "./PostOpportunityCoreFields";
import { PostOpportunityRichFields } from "./PostOpportunityRichFields";
import { PostOpportunityWhyFields } from "./PostOpportunityWhyFields";
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
 *
 * Edit mode adds two optional pieces the create flow never passes: a clean
 * form (`hasChanges` false) reads as disabled with a status line saying why,
 * and `saveAndCloseLabel` renders a second submit button that asks the caller
 * to leave the form once the save lands.
 */
export function PostVolunteerOpportunityForm({
  form,
  editing = false,
  onSubmit,
  submitting,
  submitLabel,
  submittingLabel,
  cancelTo,
  hasChanges = true,
  saveAndCloseLabel,
  isSubmittingClose = false,
  cancelState,
}: {
  form: PostOpportunityForm;
  editing?: boolean;
  onSubmit: (e: FormEvent, options: { shouldClose: boolean }) => void;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  cancelTo: string;
  /** False while nothing differs from the last saved version. */
  hasChanges?: boolean;
  /** Renders the "Save & close" submit button when given. */
  saveAndCloseLabel?: string;
  /** Which button's save is pending, so only that one says "Saving…". */
  isSubmittingClose?: boolean;
  /** Router state the Cancel link carries back to the detail page. */
  cancelState?: unknown;
}) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const baseId = useId();
  const missingId = `${baseId}-missing`;
  const noChangesId = `${baseId}-no-changes`;
  const incomplete = form.missingFields.length > 0;
  const isSaveBlocked = incomplete || submitting || !hasChanges;
  const saveDescribedBy =
    [
      incomplete ? missingId : undefined,
      editing && !hasChanges ? noChangesId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  const isPrimarySubmitting = submitting && !isSubmittingClose;
  const isCloseSubmitting = submitting && isSubmittingClose;

  /**
   * The submit button is `aria-disabled` rather than `disabled` while the form
   * is incomplete (the repo's convention — see `Button.module.css`): it looks
   * disabled but stays focusable and clickable, so a keyboard or screen-reader
   * user who presses it gets an answer instead of silence. The answer is the
   * inline errors plus focus on the first field still missing. A form with
   * no changes has nothing to save, so it answers with the status line alone.
   */
  const handleSubmit = (e: FormEvent) => {
    if (incomplete || submitting || !hasChanges) {
      e.preventDefault();
      if (submitting || !hasChanges) return;
      form.markTouched();
      focusFirstErrorAfterRender(formRef.current);
      return;
    }
    // Enter inside a field submits through the first submit button, so it
    // always means "Save changes".
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    onSubmit(e, { shouldClose: submitter?.dataset.intent === "close" });
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
        <PostOpportunityWhyFields form={form} />
        <PostOpportunityRichFields form={form} editing={editing} />

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            aria-disabled={isSaveBlocked}
            aria-describedby={saveDescribedBy}
            aria-busy={isPrimarySubmitting}
          >
            {isPrimarySubmitting ? submittingLabel : submitLabel}
            {!isPrimarySubmitting && <FiArrowRight aria-hidden />}
          </Button>
          {saveAndCloseLabel && (
            <Button
              type="submit"
              variant="ghost"
              data-intent="close"
              aria-disabled={isSaveBlocked}
              aria-describedby={saveDescribedBy}
              aria-busy={isCloseSubmitting}
            >
              {isCloseSubmitting ? submittingLabel : saveAndCloseLabel}
            </Button>
          )}
          <Button variant="ghost" to={cancelTo} state={cancelState}>
            {t("marketing:postOpportunity.actions.cancel")}
          </Button>
          {editing && (
            <span id={noChangesId} role="status" className={styles.tipBody}>
              {hasChanges
                ? null
                : t("marketing:postOpportunity.edit.noChanges")}
            </span>
          )}
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
