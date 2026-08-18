import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, SkeletonCard } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useOpportunity } from "./api/useOpportunity";
import { useOrganizationOptions } from "./api/useOrganizationOptions";
import { useUpdateOpportunity } from "./api/useOpportunityMutations";
import {
  applyFormStateToOpportunity,
  opportunityToFormState,
} from "./api/volunteering.adapters";
import { usePostOpportunityForm } from "./usePostOpportunityForm";
import { PostVolunteerOpportunityForm } from "./PostVolunteerOpportunityForm";
import type { VolunteerOpportunity } from "./volunteerOpportunities";

/** Loads the opportunity before mounting the form in edit mode — a poster
 *  who navigates here for a role they didn't post (or one that doesn't
 *  exist) sees a blocked state instead of an empty/default form. */
export function EditOpportunityFlow({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const detailPath = `${routes.volunteer}/opportunity/${slug}`;
  const { data, isLoading } = useOpportunity(slug);

  if (isLoading) return <SkeletonCard />;

  if (!data?.opportunity || !data.isPoster) {
    return (
      <EmptyState
        title={t("marketing:postOpportunity.edit.notAllowed")}
        action={{
          label: t("marketing:volunteerDetail.backCta"),
          to: detailPath,
        }}
      />
    );
  }

  return (
    <EditOpportunityFormPanel
      slug={slug}
      detailPath={detailPath}
      opportunity={data.opportunity}
    />
  );
}

/** Same `PostVolunteerOpportunityForm` the create flow renders, seeded from
 *  the opportunity and wired to PATCH instead of POST. */
function EditOpportunityFormPanel({
  slug,
  detailPath,
  opportunity,
}: {
  slug: string;
  detailPath: string;
  opportunity: VolunteerOpportunity;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const organizationOptions = useOrganizationOptions();
  const form = usePostOpportunityForm(opportunityToFormState(opportunity));
  const update = useUpdateOpportunity(slug);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.markTouched();
    if (!form.valid) return;

    // Computed up front so a successful save can hand the detail page an
    // instantly-updated view without waiting on a refetch — load-bearing in
    // demo mode, which has no server to refetch from at all (see
    // `applyFormStateToOpportunity`).
    const updated = applyFormStateToOpportunity(
      opportunity,
      form.state,
      organizationOptions,
    );
    update.mutate(form.toUpdateDto(), {
      onSuccess: () => {
        showToast(t("marketing:postOpportunity.edit.successToast"), "success");
        void navigate(detailPath, { state: { editedOpportunity: updated } });
      },
      onError: () =>
        showToast(t("marketing:postOpportunity.edit.errorToast"), "error"),
    });
  };

  return (
    <PostVolunteerOpportunityForm
      form={form}
      editing
      onSubmit={submit}
      submitting={update.isPending}
      submitLabel={t("marketing:postOpportunity.edit.saveCta")}
      submittingLabel={t("marketing:postOpportunity.edit.saving")}
      cancelTo={detailPath}
    />
  );
}
