import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, SuccessPanel } from "./ModalKit";
import { ReviewForm, type ReviewFormValues } from "./ReviewForm";
import { useCreateReview } from "./api/useCompanyMutations";
import type { CompanyReview } from "./companies.data";

/**
 * Write a review for a single company. Demo prepends the review to local state
 * (via `onCreated`) and shows the plum-panel success; live POSTs it to
 * /companies/:slug/reviews and lets the invalidated query refetch. A repeat
 * review answers 409 — surfaced as a clear "already reviewed" toast. The shared
 * body lives in <ReviewForm>; this wrapper owns the demo/live submit branch.
 */
export function CompanyReviewModal({
  slug,
  companyName,
  onClose,
  onCreated,
}: {
  slug: string;
  companyName: string;
  onClose: () => void;
  onCreated: (review: CompanyReview) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const create = useCreateReview(slug);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit({ title, rating, role, pros, cons }: ReviewFormValues) {
    const body: string[] = [];
    if (pros.trim()) body.push(`The good: ${pros.trim()}`);
    if (cons.trim()) body.push(`The hard parts: ${cons.trim()}`);
    const byline = `${role.trim()} · Rated ${rating}/5 · just now`;
    const review: CompanyReview = {
      title: title.trim(),
      stars: rating,
      byline,
      body,
    };

    setSending(true);
    if (demoMode) {
      setTimeout(() => {
        setSending(false);
        setDone(true);
        onCreated(review);
      }, 900);
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        stars: rating,
        byline,
        body,
      });
      setSending(false);
      setDone(true);
      // Live: the invalidated reviews query refetches with the new review.
    } catch (err) {
      setSending(false);
      if (err instanceof ApiError && err.status === 409) {
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
          idPrefix="cr"
          showTitle
          sending={sending}
          onSubmit={(values) => void handleSubmit(values)}
          onClose={onClose}
          copy={{
            eyebrow: t("economy:company.reviews.writeReview"),
            sub: t("economy:companyReview.sub"),
            roleLabel: t("economy:companyReview.roleLabel"),
            rolePlaceholder: t("economy:companyReview.rolePlaceholder"),
            prosPlaceholder: t("economy:companyReview.prosPlaceholder"),
            consPlaceholder: t("economy:companyReview.consPlaceholder"),
            headlineLabel: t("economy:companyReview.headlineLabel"),
            headlinePlaceholder: t("economy:companyReview.headlinePlaceholder"),
          }}
        />
      )}
    </ModalShell>
  );
}
