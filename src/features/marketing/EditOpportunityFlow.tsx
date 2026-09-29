import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, SkeletonCard } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useOpportunity } from "./api/useOpportunity";
import {
  useOrganizationOptions,
  type OrganizationOption,
} from "./api/useOrganizationOptions";
import { useUpdateOpportunity } from "./api/useOpportunityMutations";
import {
  applyFormStateToOpportunity,
  opportunityToFormState,
} from "./api/volunteering.adapters";
import { usePostOpportunityForm } from "./usePostOpportunityForm";
import { PostVolunteerOpportunityForm } from "./PostVolunteerOpportunityForm";
import type { VolunteerOpportunity } from "./volunteerOpportunities";

/** The organisation the opportunity is already linked to, as picker options,
 *  so the link stays selectable after its poster stops running that
 *  organisation. A card without a slug has nothing to link back to. */
function pinnedOrganizationsFor(
  opportunity: VolunteerOpportunity,
): OrganizationOption[] {
  const { partner, community } = opportunity;
  return [
    ...(partner?.slug
      ? [{ kind: "partner" as const, slug: partner.slug, name: partner.name }]
      : []),
    ...(community?.slug
      ? [
          {
            kind: "community" as const,
            slug: community.slug,
            name: community.name,
          },
        ]
      : []),
  ];
}

/** Loads the opportunity before mounting the form in edit mode — a poster
 *  who navigates here for a role they didn't post (or one that doesn't
 *  exist) sees a blocked state instead of an empty/default form. */
export function EditOpportunityFlow({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const detailPath = `${routes.volunteer}/opportunity/${slug}`;
  const { data, isLoading } = useOpportunity(slug);

  if (isLoading) return <SkeletonCard />;

  // Poster-only: `canEditOpportunity` is the API's own edit capability, which
  // (unlike `canReviewApplicants`) never widens to the attributed community's
  // owners and mods.
  if (!data?.opportunity || !data.canEditOpportunity) {
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
 *  the opportunity and wired to PATCH instead of POST. "Save changes" stays
 *  on the form; "Save & close" returns to the detail page. */
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
  const pinnedOrganizations = useMemo(
    () => pinnedOrganizationsFor(opportunity),
    [opportunity],
  );
  const organizationOptions = useOrganizationOptions(pinnedOrganizations);
  const form = usePostOpportunityForm(opportunityToFormState(opportunity), {
    pinnedOrganizations,
  });
  const update = useUpdateOpportunity(slug);
  // The last saved version as its update DTO, so whitespace-only edits and
  // empty added rows never count as changes.
  const [savedDtoJson, setSavedDtoJson] = useState(() =>
    JSON.stringify(form.toUpdateDto()),
  );
  const [isClosingSave, setIsClosingSave] = useState(false);
  // Demo mode has no server, so Cancel after a stay-save hands the detail
  // page the saved view the same way "Save & close" does.
  const [latestOpportunity, setLatestOpportunity] =
    useState<VolunteerOpportunity>();
  const hasChanges = JSON.stringify(form.toUpdateDto()) !== savedDtoJson;

  const submit = (
    event: FormEvent,
    { shouldClose }: { shouldClose: boolean },
  ) => {
    event.preventDefault();
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
    // Captured before the request, so edits typed while it runs stay dirty.
    const sentDto = form.toUpdateDto();
    const sentDtoJson = JSON.stringify(sentDto);
    setIsClosingSave(shouldClose);
    update.mutate(sentDto, {
      onSuccess: () => {
        showToast(t("marketing:postOpportunity.edit.successToast"), "success");
        if (shouldClose) {
          void navigate(detailPath, { state: { editedOpportunity: updated } });
          return;
        }
        setSavedDtoJson(sentDtoJson);
        setLatestOpportunity(updated);
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
      cancelState={
        latestOpportunity ? { editedOpportunity: latestOpportunity } : undefined
      }
      hasChanges={hasChanges}
      saveAndCloseLabel={t("marketing:postOpportunity.edit.saveAndCloseCta")}
      isSubmittingClose={isClosingSave}
    />
  );
}
