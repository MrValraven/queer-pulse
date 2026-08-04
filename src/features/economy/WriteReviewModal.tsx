import { useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, SuccessPanel } from "./ModalKit";
import { ReviewForm, type ReviewFormValues } from "./ReviewForm";
import { useSubmitFlow } from "./modalFlow";
import type { Company, Review } from "./employerReviews.data";
import shell from "./ApplicationModals.module.css";

export interface SubmittedReview {
  /** Company the review is about. */
  companyName: string;
  review: Review;
}

/**
 * Demo "Write a review" flow: pick a company, rate it, name your role, and leave
 * pros + cons. On submit it simulates a post (via `useSubmitFlow`), prepends an
 * anonymous review to that company, and shows the plum-panel success. The shared
 * body lives in <ReviewForm>; this wrapper owns the company picker + submit.
 */
export function WriteReviewModal({
  companies,
  initialCompany,
  onClose,
  onSubmit,
}: {
  companies: Company[];
  initialCompany?: string;
  onClose: () => void;
  onSubmit: (review: SubmittedReview) => void;
}) {
  const { t } = useTranslation();
  const [company, setCompany] = useState(
    initialCompany ?? companies[0]?.name ?? "",
  );
  const { submit, sending, done } = useSubmitFlow();

  const handleSubmit = ({ rating, role, pros, cons }: ReviewFormValues) => {
    const parts: string[] = [];
    if (pros.trim()) parts.push(`The good: ${pros.trim()}`);
    if (cons.trim()) parts.push(`The hard parts: ${cons.trim()}`);
    const review: Review = {
      text: `"${parts.join(" ")}"`,
      meta: [role.trim(), `Rated ${rating}/5`, "just now"],
    };
    submit(() => onSubmit({ companyName: company, review }));
  };

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:companyReview.success.title")}
          em={t("economy:companyReview.success.em")}
          onClose={onClose}
        >
          <Translation
            i18nKey="economy:writeReviewModal.success.body"
            values={{ company }}
          />
        </SuccessPanel>
      ) : (
        <ReviewForm
          idPrefix="wr"
          sending={sending}
          submitDisabled={company.trim().length === 0}
          onSubmit={handleSubmit}
          onClose={onClose}
          copy={{
            eyebrow: t("economy:writeReviewModal.eyebrow"),
            sub: t("economy:writeReviewModal.sub"),
            roleLabel: t("economy:writeReviewModal.roleLabel"),
            rolePlaceholder: t("economy:writeReviewModal.rolePlaceholder"),
            prosPlaceholder: t("economy:writeReviewModal.prosPlaceholder"),
            consPlaceholder: t("economy:writeReviewModal.consPlaceholder"),
          }}
          companySelect={
            <div className={shell.field}>
              <label htmlFor="wr-company">
                {t("economy:writeReviewModal.companyLabel")}
              </label>
              <select
                id="wr-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              >
                {companies.map((companyOption) => (
                  <option key={companyOption.name}>{companyOption.name}</option>
                ))}
              </select>
            </div>
          }
        />
      )}
    </ModalShell>
  );
}
