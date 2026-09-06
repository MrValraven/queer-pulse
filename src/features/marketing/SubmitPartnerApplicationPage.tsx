import { type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowRight, FiLogIn } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SuccessPanel,
} from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
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
  const location = useLocation();
  const { showToast } = useToast();
  const { loggedIn, checking, signIn } = useAuth();
  // PRD-266. The For Organisations page hands the organisation's name over as
  // `?org=` so the applicant does not retype what they already typed there.
  // Read once, into the form's initial state (see `useSubmitPartnerForm`).
  const [searchParams] = useSearchParams();
  const form = useSubmitPartnerForm(t, searchParams.get("org") ?? "");
  const submitApp = useSubmitPartnerApplication();

  // `POST /partner-applications` is `ActiveMemberGuard`ed and stamps the
  // submitter on the row, because the decision notification and the "where is
  // my application?" page are both addressed to that account, and the in-app
  // bell is the only reply path there is. So a logged-out visitor is told that
  // before filling anything in, rather than after being 401'd on submit. The
  // page itself stays public: a prospective partner has to be able to READ
  // what is being asked of them before deciding to join.
  const isSignedOut = !checking && !loggedIn;

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

          {isSignedOut ? (
            <FadeIn className={styles.successWrap}>
              <EmptyState
                icon={<FiLogIn />}
                title={t("marketing:submitPartner.signedOut.title")}
                description={t("marketing:submitPartner.signedOut.body")}
                action={{
                  label: t("marketing:submitPartner.signedOut.signInCta"),
                  onClick: () =>
                    signIn(`${location.pathname}${location.search}`),
                }}
                secondaryAction={{
                  label: t("marketing:submitPartner.signedOut.contactCta"),
                  to: `${routes.contact}?topic=partnership`,
                }}
              />
            </FadeIn>
          ) : submitted ? (
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
