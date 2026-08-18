import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FadeIn, SuccessPanel } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { usePostOpportunityForm } from "./usePostOpportunityForm";
import { useCreateOpportunity } from "./api/useOpportunityMutations";
import { PostVolunteerOpportunityForm } from "./PostVolunteerOpportunityForm";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** The "Post an opportunity" create flow — the form, or the plum success
 *  panel once posted. Slug back from the server → jump straight to the new
 *  listing; demo mode returns none → show the panel in place. */
export function CreateOpportunityFlow() {
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

  if (posted) {
    return (
      <FadeIn className={styles.successWrap}>
        <SuccessPanel
          title={t("marketing:postOpportunity.success.title")}
          em={t("marketing:postOpportunity.success.em")}
          closeLabel={
            <>
              {t("marketing:postOpportunity.success.closeLabel")}{" "}
              <FiArrowRight aria-hidden />
            </>
          }
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
    );
  }

  return (
    <PostVolunteerOpportunityForm
      form={form}
      onSubmit={submit}
      submitting={create.isPending}
      submitLabel={t("marketing:postOpportunity.actions.submit")}
      submittingLabel={t("marketing:postOpportunity.actions.posting")}
      cancelTo={routes.volunteer}
    />
  );
}
