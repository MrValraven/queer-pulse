import { useMemo, useState } from "react";
import { Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, SuccessPanel } from "./ModalKit";
import { ReviewForm, type ReviewFormValues } from "./ReviewForm";
import { useCreateReview } from "./api/useCompanyMutations";
import type { EmployerCard } from "./api/companies.adapters";
import shell from "./ApplicationModals.module.css";

/**
 * The live-mode "write a review" flow for the employer-reviews page. Unlike the
 * demo `WriteReviewModal` (which mutates local mock state), this posts to
 * POST /companies/:slug/reviews via `useCreateReview` for the chosen company,
 * mapping the form to a `CreateReviewDto`; the mutation invalidates the reviews
 * query so a subsequent CompanyPage visit shows the new review. A repeat review
 * answers 409, surfaced as a clear "already reviewed" toast. The shared body
 * lives in <ReviewForm>; this wrapper owns the company picker + live mutation.
 */
export function LiveWriteReviewModal({
  companies,
  initialSlug,
  onClose,
}: {
  companies: EmployerCard[];
  initialSlug?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Only companies with a resolved slug can receive a review (the endpoint is
  // keyed by slug); drop any card that lacks one.
  const reviewable = useMemo(
    () => companies.filter((company) => Boolean(company.slug)),
    [companies],
  );

  const [slug, setSlug] = useState(initialSlug ?? reviewable[0]?.slug ?? "");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const create = useCreateReview(slug);
  const companyName =
    reviewable.find((company) => company.slug === slug)?.name ?? "";

  async function handleSubmit({
    title,
    rating,
    role,
    pros,
    cons,
  }: ReviewFormValues) {
    const body: string[] = [];
    if (pros.trim()) body.push(`The good: ${pros.trim()}`);
    if (cons.trim()) body.push(`The hard parts: ${cons.trim()}`);
    const byline = `${role.trim()} · Rated ${rating}/5 · just now`;

    setSending(true);
    try {
      await create.mutateAsync({
        title: title.trim(),
        stars: rating,
        byline,
        body,
      });
      setSending(false);
      setDone(true);
    } catch (error) {
      setSending(false);
      if (error instanceof ApiError && error.status === 409) {
        showToast(t("economy:companyReview.toast.alreadyReviewed"), "error");
      } else {
        showToast(t("economy:companyReview.toast.error"), "error");
      }
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:company.reviews.writeReview")}
    >
      {done ? (
        <SuccessPanel
          title={t("economy:companyReview.success.title")}
          em={t("economy:companyReview.success.em")}
          onClose={onClose}
        >
          <Translation
            i18nKey="economy:companyReview.success.body"
            values={{ companyName }}
          />
        </SuccessPanel>
      ) : (
        <ReviewForm
          idPrefix="lwr"
          showTitle
          sending={sending}
          submitDisabled={slug.length === 0}
          submitDisabledLabel={t("economy:companyReview.missing.company")}
          onSubmit={(values) => void handleSubmit(values)}
          onClose={onClose}
          copy={{
            eyebrow: t("economy:writeReviewModal.eyebrow"),
            sub: t("economy:companyReview.sub"),
            roleLabel: t("economy:companyReview.roleLabel"),
            rolePlaceholder: t("economy:companyReview.rolePlaceholder"),
            prosPlaceholder: t("economy:companyReview.prosPlaceholder"),
            consPlaceholder: t("economy:companyReview.consPlaceholder"),
            headlineLabel: t("economy:companyReview.headlineLabel"),
            headlinePlaceholder: t("economy:companyReview.headlinePlaceholder"),
          }}
          companySelect={
            <div className={shell.field}>
              <label htmlFor="lwr-company">
                {t("economy:writeReviewModal.companyLabel")}
              </label>
              <Select
                id="lwr-company"
                options={reviewable.map((company) => ({
                  value: company.slug ?? "",
                  label: company.name,
                }))}
                value={slug}
                onChange={(value) => setSlug(value ?? "")}
              />
            </div>
          }
        />
      )}
    </ModalShell>
  );
}
