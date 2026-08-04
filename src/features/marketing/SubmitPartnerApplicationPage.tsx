import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, FadeIn, SuccessPanel } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { routes } from "../../app/routeMap";
import { useSubmitPartnerForm } from "./useSubmitPartnerForm";
import { useSubmitPartnerApplication } from "./api/useSubmitPartnerApplication";
import { SubmitPartnerFields } from "./SubmitPartnerFields";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
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
      onError: (error) =>
        showToast(
          describeError("Couldn't send your application", error),
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
            <div className={styles.eye}>
              {t("marketing:submitPartner.hero.eyebrow")}
            </div>
            <h1 className={styles.title}>
              <Translation
                i18nKey="marketing:submitPartner.hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.sub}>
              {t("marketing:submitPartner.hero.sub")}
            </p>
          </div>

          {submitted ? (
            <FadeIn className={styles.successWrap}>
              <SuccessPanel
                title={t("marketing:submitPartner.success.title")}
                em={t("marketing:submitPartner.success.em")}
                closeLabel={
                  <>
                    {t("marketing:submitPartner.success.closeLabel")}{" "}
                    <FiArrowRight aria-hidden />
                  </>
                }
                onClose={() => void navigate(routes.partners)}
                steps={[
                  t("marketing:submitPartner.success.step1"),
                  t("marketing:submitPartner.success.step2"),
                  t("marketing:submitPartner.success.step3"),
                ]}
              >
                {t("marketing:submitPartner.success.body")}
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
                    {submitApp.isPending
                      ? t("marketing:submitPartner.actions.sending")
                      : t("marketing:submitPartner.actions.submit")}
                    {!submitApp.isPending && <FiArrowRight aria-hidden />}
                  </Button>
                  <Button variant="ghost" to={routes.partners}>
                    {t("marketing:submitPartner.actions.cancel")}
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
