import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FadeIn, SuccessPanel } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { usePostOpportunityForm } from "./usePostOpportunityForm";
import { useCreateOpportunity } from "./api/useOpportunityMutations";
import { PostOpportunityCoreFields } from "./PostOpportunityCoreFields";
import { PostOpportunityRichFields } from "./PostOpportunityRichFields";
import { POST_TIPS } from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

export function PostVolunteerOpportunityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const form = usePostOpportunityForm();
  const create = useCreateOpportunity();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.markTouched();
    if (!form.valid) return; // inline required-field errors now render

    create.mutate(form.toDto(), {
      onSuccess: (res) => {
        // Live mode returns a slug → jump to the new listing. Demo mode returns
        // no slug → show the plum success panel (never hits the network).
        if (res.slug) {
          void navigate(`${routes.volunteer}/opportunity/${res.slug}`);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      onError: () =>
        showToast(t("marketing:postOpportunity.toast.error"), "error"),
    });
  };

  const posted = create.isSuccess && !create.data?.slug;

  return (
    <PageShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eye}>
              {t("marketing:postOpportunity.hero.eyebrow")}
            </div>
            <h1 className={styles.title}>
              <Translation
                i18nKey="marketing:postOpportunity.hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.sub}>
              {t("marketing:postOpportunity.hero.sub")}
            </p>
          </div>

          {posted ? (
            <FadeIn className={styles.successWrap}>
              <SuccessPanel
                title={t("marketing:postOpportunity.success.title")}
                em={t("marketing:postOpportunity.success.em")}
                closeLabel={t("marketing:postOpportunity.success.closeLabel")}
                onClose={() => void navigate(routes.volunteer)}
                steps={[
                  t("marketing:postOpportunity.success.step1"),
                  t("marketing:postOpportunity.success.step2"),
                  t("marketing:postOpportunity.success.step3"),
                ]}
              >
                {t("marketing:postOpportunity.success.body")}
              </SuccessPanel>
            </FadeIn>
          ) : (
            <div className={styles.layout}>
              <form className={styles.form} onSubmit={submit} noValidate>
                <PostOpportunityCoreFields form={form} />
                <PostOpportunityRichFields form={form} />

                <div className={styles.actions}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={create.isPending}
                    aria-busy={create.isPending}
                  >
                    {create.isPending
                      ? t("marketing:postOpportunity.actions.posting")
                      : t("marketing:postOpportunity.actions.submit")}
                  </Button>
                  <Button variant="ghost" to={routes.volunteer}>
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
          )}
        </div>
      </section>
    </PageShell>
  );
}
