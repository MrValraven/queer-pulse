import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FadeIn, SuccessPanel } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useSubmitPartnerForm } from "./useSubmitPartnerForm";
import { useSubmitPartnerApplication } from "./api/useSubmitPartnerApplication";
import { SubmitPartnerFields } from "./SubmitPartnerFields";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { APPLY_TIPS } from "./submitPartnerApplication.data";
import styles from "./SubmitPartnerApplicationPage.module.css";

export function SubmitPartnerApplicationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const form = useSubmitPartnerForm(t);
  const submitApp = useSubmitPartnerApplication();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    form.markTouched();
    if (!form.valid) return; // inline required-field errors now render

    submitApp.mutate(form.toDto(), {
      onSuccess: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      onError: () =>
        showToast(
          "Couldn't send your application — please try again.",
          "error",
        ),
    });
  };

  // Both demo (no network) and live (a freshly created pending application that
  // isn't publicly visible yet) land on the same plum success panel.
  const submitted = submitApp.isSuccess;

  return (
    <PageShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eye}>Partners · Apply</div>
            <h1 className={styles.title}>
              Apply to <em>partner.</em>
            </h1>
            <p className={styles.sub}>
              QueerPulse partnerships are operational, not promotional. Tell us
              who you are and what you do — honestly — and we'll read every
              word.
            </p>
          </div>

          {submitted ? (
            <FadeIn className={styles.successWrap}>
              <SuccessPanel
                title="Application"
                em="received."
                closeLabel="Back to partners →"
                onClose={() => navigate(routes.partners)}
                steps={[
                  "It's pending review with the partnerships team",
                  "We read every application, not just the tidy ones",
                  "We'll be in touch — a yes, a not-yet, or a question",
                ]}
              >
                Thank you for reaching out. Your application is in — nothing
                goes live until we've talked it through with you.
              </SuccessPanel>
            </FadeIn>
          ) : (
            <div className={styles.layout}>
              <form className={styles.form} onSubmit={onSubmit} noValidate>
                <SubmitPartnerFields form={form} />

                <div className={styles.actions}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={submitApp.isPending}
                    aria-busy={submitApp.isPending}
                  >
                    {submitApp.isPending ? "Sending…" : "Submit application →"}
                  </Button>
                  <Button variant="ghost" to={routes.partners}>
                    Cancel
                  </Button>
                </div>
              </form>

              <aside className={styles.sidebar}>
                {APPLY_TIPS.map((tip) => (
                  <div className={styles.tipCard} key={tip.titleKey}>
                    <div className={styles.tipTitle}>{t(tip.titleKey)}</div>
                    <div className={styles.tipBody}>{t(tip.bodyKey)}</div>
                  </div>
                ))}
              </aside>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
